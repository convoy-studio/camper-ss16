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
			this.pxContainer.init('#pages-container');
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
			var el = $(elementId);
			$(this.renderer.view).attr('id', 'px-container');
			_AppStore2['default'].Canvas = this.renderer.view;
			el.append(this.renderer.view);
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
	var leftBlock = bottomTextsContainer.find('.left-text').get(0);
	var rightBlock = bottomTextsContainer.find('.right-text').get(0);
	var leftFront = $(leftBlock).find('.front-wrapper').get(0);
	var rightFront = $(rightBlock).find('.front-wrapper').get(0);

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

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/character.js":[function(require,module,exports){
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

			setTimeout(function () {
				var scale = (windowH - 100) / textureSize.height * 1;
				sprite.scale.x = sprite.scale.y = scale;
				sprite.x = size[0] >> 1;
				sprite.y = size[1] - (textureSize.height * scale >> 1) + 10;
				sprite.ix = sprite.x;
				sprite.iy = sprite.y;
			});
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/diptyque-part.js":[function(require,module,exports){
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
			mask.clear();
			sprite.destroy();
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-home.js":[function(require,module,exports){
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

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./video-canvas":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/video-canvas.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-positions.js":[function(require,module,exports){
/*
	width: width of grid
	height: height of grid
	rows: number of rows
	columns: number of columns
*/

"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports["default"] = function (width, height, rows, columns) {

	var blockSize = [width / columns, height / rows];
	var blocksLen = rows * columns;
	var positions = [];

	var posX = 0;
	var posY = 0;
	var columnCounter = 0;

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

	return {
		rows: rows,
		columns: columns,
		blockSize: blockSize,
		positions: positions
	};
};

module.exports = exports["default"];

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

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/main-shoe.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

exports['default'] = function (holder, shoeUrl, textureSize) {

	var scope;

	var tex = PIXI.Texture.fromImage(shoeUrl);
	var sprite = new PIXI.Sprite(tex);
	sprite.anchor.x = sprite.anchor.y = 0.5;
	holder.addChild(sprite);

	scope = {
		update: function update(mouse) {
			var windowW = _AppStore2['default'].Window.w;
			var nX = (mouse.x - (windowW >> 1)) / (windowW >> 1) * 1 - 0.5;
			var nY = mouse.nY - 0.5;
			var newx = sprite.ix + 30 * nX;
			var newy = sprite.iy - 20 * nY;
			sprite.x += (newx - sprite.x) * 0.08;
			sprite.y += (newy - sprite.y) * 0.06;
		},
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			var size = [(windowW >> 1) + 1, windowH];

			setTimeout(function () {
				var scale = (windowH - 400) / textureSize.height * 1;
				sprite.scale.x = sprite.scale.y = scale;
				sprite.x = size[0] >> 1;
				sprite.y = size[1] >> 1;
				sprite.ix = sprite.x;
				sprite.iy = sprite.y;
			});
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/map-home.js":[function(require,module,exports){
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

exports['default'] = function (parent) {

	var onDotClick = function onDotClick(e) {
		e.preventDefault();
		var id = e.target.id;
		var parentId = e.target.getAttribute('data-parent-id');
		_Router2['default'].setHash(parentId + '/' + id);
	};

	var scope;
	var $el = parent.find('.map-wrapper');
	var el = $el.get(0);
	var titlesWrapper = $el.find('.titles-wrapper').get(0);
	var mapdots = $el.find('#map-dots path').get();

	for (var i = 0; i < mapdots.length; i++) {
		var dot = mapdots[i];
		dot.addEventListener('click', onDotClick);
	};

	var titles = {
		'deia': {
			el: $(titlesWrapper).find(".deia").get(0)
		},
		'es-trenc': {
			el: $(titlesWrapper).find(".es-trenc").get(0)
		},
		'arelluf': {
			el: $(titlesWrapper).find(".arelluf").get(0)
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
			el.style.left = (windowW >> 1) - (mapSize[0] >> 1) + 'px';
			el.style.top = (windowH >> 1) - (mapSize[1] >> 1) + 'px';

			titles['deia'].el.style.left = titlePosX(mapSize[0], 640) + 'px';
			titles['deia'].el.style.top = titlePosY(mapSize[1], 280) + 'px';
			titles['es-trenc'].el.style.left = titlePosX(mapSize[0], 1180) + 'px';
			titles['es-trenc'].el.style.top = titlePosY(mapSize[1], 760) + 'px';
			titles['arelluf'].el.style.left = titlePosX(mapSize[0], 210) + 'px';
			titles['arelluf'].el.style.top = titlePosY(mapSize[1], 460) + 'px';
		},
		clear: function clear() {
			for (var i = 0; i < mapdots.length; i++) {
				var dot = mapdots[i];
				dot.removeEventListener('click', onDotClick);
			};
			titles = null;
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Diptyque.js":[function(require,module,exports){
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

var _mainShoe = require('./../main-shoe');

var _mainShoe2 = _interopRequireDefault(_mainShoe);

var _shoesHolder = require('./../shoes-holder');

var _shoesHolder2 = _interopRequireDefault(_shoesHolder);

var Diptyque = (function (_Page) {
	_inherits(Diptyque, _Page);

	function Diptyque(props) {
		_classCallCheck(this, Diptyque);

		_get(Object.getPrototypeOf(Diptyque.prototype), 'constructor', this).call(this, props);

		this.onMouseMove = this.onMouseMove.bind(this);
	}

	_createClass(Diptyque, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this = this;

			this.mouse = new PIXI.Point();
			this.mouse.nX = this.mouse.nY = 0;

			this.leftPart = (0, _diptyquePart2['default'])(this.pxContainer, this.getImageUrlById('shoe-bg'));
			this.rightPart = (0, _diptyquePart2['default'])(this.pxContainer, this.getImageUrlById('character-bg'));

			this.character = (0, _character2['default'])(this.rightPart.holder, this.getImageUrlById('character'), this.getImageSizeById('character'));
			this.shoe = (0, _mainShoe2['default'])(this.leftPart.holder, this.getImageUrlById('shoe'), this.getImageSizeById('shoe'));
			this.shoesHolder = (0, _shoesHolder2['default'])(this.pxContainer);

			window.addEventListener('mousemove', this.onMouseMove);

			setTimeout(function () {
				return _this.shoesHolder.open();
			}, 2000);

			_get(Object.getPrototypeOf(Diptyque.prototype), 'componentDidMount', this).call(this);
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
		key: 'willTransitionIn',
		value: function willTransitionIn() {
			_AppStore2['default'].Canvas.style['z-index'] = 4;
			_get(Object.getPrototypeOf(Diptyque.prototype), 'willTransitionIn', this).call(this);
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
			this.character.update(this.mouse);
			this.shoe.update(this.mouse);
			this.leftPart.update(this.mouse);
			this.rightPart.update(this.mouse);
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
			this.shoe.resize();
			this.shoesHolder.resize();

			this.rightPart.holder.x = windowW >> 1;

			_get(Object.getPrototypeOf(Diptyque.prototype), 'resize', this).call(this);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			this.leftPart.clear();
			this.rightPart.clear();
			_get(Object.getPrototypeOf(Diptyque.prototype), 'componentWillUnmount', this).call(this);
		}
	}]);

	return Diptyque;
})(_Page3['default']);

exports['default'] = Diptyque;
module.exports = exports['default'];

},{"./../../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../Page":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/Page.js","./../character":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/character.js","./../diptyque-part":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/diptyque-part.js","./../main-shoe":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/main-shoe.js","./../shoes-holder":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/shoes-holder.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Home.js":[function(require,module,exports){
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

var _mapHome = require('./../map-home');

var _mapHome2 = _interopRequireDefault(_mapHome);

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
			this.transitionInCompleted = false;
			this.lastGridItemIndex;
			this.videoTriggerCounter = 200;
			this.imageTriggerCounter = 0;

			this.seats = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23, 24, 25];

			this.usedSeats = [];

			this.bg = this.element.find(".bg-wrapper").get(0);

			this.grid = (0, _gridHome2['default'])(this.props, this.element, this.onItemEnded);
			this.bottomTexts = (0, _bottomTextsHome2['default'])(this.element);
			this.aroundBorder = (0, _aroundBorderHome2['default'])(this.element);
			this.map = (0, _mapHome2['default'])(this.element);

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
			this.transitionInCompleted = true;
			_AppStore2['default'].Canvas.style['z-index'] = 0;
			_get(Object.getPrototypeOf(Home.prototype), 'didTransitionInComplete', this).call(this);
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

},{"./../../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./../Page":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/Page.js","./../around-border-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/around-border-home.js","./../bottom-texts-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/bottom-texts-home.js","./../grid-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-home.js","./../map-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/map-home.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/shoes-grid.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _gridPositions = require('./grid-positions');

var _gridPositions2 = _interopRequireDefault(_gridPositions);

var _img = require('img');

var _img2 = _interopRequireDefault(_img);

var _Utils = require('./../utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

exports['default'] = function (parent) {
	var scope;

	var urls = _AppStore2['default'].diptyqueShoes();
	var loaded = 0;
	var sprites = [];
	var grid;
	var bigImgW = 0;
	var allImgLoaded = false;

	var holder = new PIXI.Container();
	parent.addChild(holder);

	var bg = new PIXI.Graphics();
	holder.addChild(bg);

	var shoesHolder = new PIXI.Container();
	holder.addChild(shoesHolder);

	var sprites = [];
	for (var i = 0; i < urls.length; i++) {
		var url = urls[i];
		var id = _Utils2['default'].GetImgUrlId(url);
		var c = new PIXI.Container();
		var sprt = new PIXI.Sprite();
		c.addChild(sprt);
		shoesHolder.addChild(c);
		sprites[i] = {
			url: url,
			id: id,
			container: c,
			sprite: sprt
		};
	};

	var getSpriteById = function getSpriteById(id) {
		for (var i = 0; i < sprites.length; i++) {
			var sprt = sprites[i];
			if (id == sprt.id) return sprt;
		};
	};

	var setupSprites = function setupSprites() {
		for (var i = 0; i < urls.length; i++) {
			var tex = PIXI.Texture.fromImage(urls[i]);
			var c = new PIXI.Container();
			// var sprite = new PIXI.Sprite(tex)
			var sprite = sprites[i].sprite;
			sprite.texture = tex;
			sprites[i].container.addChild(sprite);
			sprite.anchor.x = sprite.anchor.y = 0.5;
			// sprites[i].sprite = sprite
		}
	};

	var resizeSprites = function resizeSprites() {
		var positions = grid.positions;
		for (var i = 0; i < sprites.length; i++) {
			var container = sprites[i].container;
			var pos = positions[i];
			var resizeVars = _Utils2['default'].ResizePositionProportionally(grid.blockSize[0], grid.blockSize[1], sprites[i].img.width, sprites[i].img.height, _AppConstants2['default'].LANDSCAPE);
			container.x = pos[0] + (grid.blockSize[0] >> 1);
			container.y = pos[1] + (grid.blockSize[1] >> 1);
			container.scale.x = container.scale.y = resizeVars.scale - 0.3;
		};
	};

	var imgLoaded = function imgLoaded(error, el) {
		loaded++;

		var src = el.src;
		var sprt = getSpriteById(_Utils2['default'].GetImgUrlId(src));
		sprt.img = el;

		if (bigImgW < el.width) bigImgW = el.width;
		if (loaded == urls.length) {
			allImgLoaded = true;
			setupSprites();
			scope.resize();
		}
	};

	scope = {
		sprites: sprites,
		holder: holder,
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var size = [(windowW >> 1) + 1, windowH];
			var gridSize = [size[0] * 0.6, size[1] * 0.8];
			grid = (0, _gridPositions2['default'])(gridSize[0], gridSize[1], 3, 1);

			bg.clear();
			bg.beginFill(0xffffff, 1);
			bg.drawRect(0, 0, size[0], size[1]);
			bg.endFill();

			if (!allImgLoaded) return;
			resizeSprites();
			shoesHolder.x = (size[0] >> 1) - (gridSize[0] >> 1);
			shoesHolder.y = (size[1] >> 1) - (gridSize[1] >> 1);
		},
		load: function load() {
			for (var i = 0; i < urls.length; i++) {
				var url = urls[i];
				(0, _img2['default'])(url, imgLoaded);
			};
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./grid-positions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-positions.js","img":"img"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/shoes-holder.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _Utils = require('./../utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _colorUtils = require('color-utils');

var _colorUtils2 = _interopRequireDefault(_colorUtils);

var _shoesGrid = require('./shoes-grid');

var _shoesGrid2 = _interopRequireDefault(_shoesGrid);

exports['default'] = function (pxContainer) {
	var scope;

	var holder = new PIXI.Container();
	pxContainer.addChild(holder);

	var bgColors = [];
	bgColors.length = 5;

	for (var i = 0; i < bgColors.length; i++) {
		var bgColor = new PIXI.Graphics();
		bgColors[i] = bgColor;
		holder.addChild(bgColor);
	};

	var sGrid = (0, _shoesGrid2['default'])(holder);
	sGrid.load();

	var tl = new TimelineLite();

	scope = {
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			var size = [(windowW >> 1) + 1, windowH];

			sGrid.resize();

			tl.clear();

			var initialS = 87;
			var v = 92;
			var lightStep = Math.round(initialS / bgColors.length);
			var delay = 0.12;
			var len = bgColors.length;
			for (var i = 0; i < len; i++) {
				var bgColor = bgColors[i];
				var s = initialS - lightStep * i - lightStep;
				if (s <= 0) {
					s = 0;
					v = 100;
				}
				var c = '0x' + _colorUtils2['default'].hsvToHex(147, s, v);
				bgColor.clear();
				bgColor.beginFill(c, 1);
				bgColor.drawRect(0, 0, size[0], size[1]);
				bgColor.endFill();

				tl.fromTo(bgColor, 1.4, { y: -windowH }, { y: windowH, ease: Expo.easeInOut }, delay * i);
			};

			tl.from(sGrid.holder, 1, { y: -windowH, ease: Expo.easeInOut }, delay * len);

			for (var i = 0; i < sGrid.sprites.length; i++) {
				var sprt = sGrid.sprites[i];
				tl.from(sprt.sprite.scale, 1, { x: 0, y: 0, ease: Back.easeOut }, delay * len + 0.4 + i * 0.1);
			};

			tl.pause(0);
		},
		open: function open() {
			tl.play(0);
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./shoes-grid":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/shoes-grid.js","color-utils":"color-utils"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/social-links.js":[function(require,module,exports){
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
		},
		show: function show() {
			setTimeout(function () {
				return $(wrapper).removeClass('hide');
			}, 1000);
		},
		hide: function hide() {
			setTimeout(function () {
				return $(wrapper).addClass('hide');
			}, 500);
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
    return "<div class='page-wrapper diptyque-page'>\n\n</div>";
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
    + "</div>\n				<div class=\"logo\">\n					<img src=\"image/logo-mallorca.png\">\n				</div>\n			</div>\n			<div class=\"background\"></div>\n		</div>\n	</div>\n	<div class=\"around-border-container\">\n		<div class=\"top\"></div>\n		<div class=\"bottom\"></div>\n		<div class=\"left\"></div>\n		<div class=\"right\"></div>\n\n		<div class=\"left-step-top\"></div>\n		<div class=\"left-step-bottom\"></div>\n		<div class=\"right-step-top\"></div>\n		<div class=\"right-step-bottom\"></div>\n	</div>\n	<div class=\"around-border-letters-container\">\n		<div class=\"top\">\n			<div>a</div>\n			<div>b</div>\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"bottom\">\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n		</div>\n		<div class=\"left\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n		</div>\n		<div class=\"right\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n		</div>\n\n		<div class=\"left-step-top\">\n			<div>a</div>\n			<div>b</div>\n		</div>\n		<div class=\"left-step-bottom\">\n			<div>4</div>\n		</div>\n		<div class=\"right-step-top\">\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"right-step-bottom\">\n			<div>4</div>\n		</div>\n	</div>\n\n	<div class=\"map-wrapper\">\n		\n		<div class=\"titles-wrapper\">\n			<div class=\"deia\">DEIA</div>\n			<div class=\"es-trenc\">ES TRENC</div>\n			<div class=\"arelluf\">ARELLUF</div>\n		</div>\n\n		<svg width=\"100%\" viewBox=\"0 0 693 645\">\n			<path id=\"map-bg\" fill=\"#1EEA79\" d=\"M9.268,289.394l9.79-7.798l1.891,0.793l-1.629,5.021l-5.286,4.504l-4.354,7.012l-3.088-1.198l-2.234,2.885l0,0l-2.382-1.177L9.268,289.394z M573.58,174.211l19.89-13.82l8.901-2.479l5.354-4.809l1.56-5.555l-1-6.922l1.445-3.973l5.057-2.523l4.271,2.01l11.906,9.165l2.693,4.917l2.892,1.575l11.482,1.367l3.057,1.949l4.418,5.211l7.768,2.221l5.832,4.916l6.305,0.215l6.373-1.22l1.989,1.88l0.409,1.963l-5.336,10.428l-0.229,3.869l1.441,1.647l0.854,0.958l7.395-0.427l2.347,1.54l0.903,2.519l-2.102,3.054l-8.425,3.183l-2.169,7.116l0.344,3.183l3.073,4.231l0.015,2.846l-2.019,1.45l-0.739,3.843l2.166,16.687l-0.982,1.88l-6.785-3.757l-1.758,0.254l-2.019,4.468l1.032,6.237l-0.605,4.827l-0.363,2.868l-1.495,1.665l-2.102-0.129l-8.341-3.847l-4.011-0.405l-2.711,1.604l-7.438,16.497l-3.284,11.599l3.22,10.597l1.64,1.859l4.386-0.28l1.478,1.69l-1.937,3.395l-2.693,1.095l-7.851-0.129l-2.546,1.622l-2.661,3.718l0.129,0.897l0.609,4.446l-1.478,4.313l-3.68,3.312l-3.909,1.173l-11.989,7.758l-5.354,7.967l-8.938,6.539l-3.351,6.663l-5.78,6.542l-4.827,8.182l0.294,3.908l-4.896,12.287l-2.02,5.107l-3.202,22.393l0.721,8.842l-1.033,2.95l-1.725-0.276l-4.125-4.468l-1.624,0.962l-1.396,3.272l1.822,4.848l-1.692,5.021l-4.731,6.604l-8.062,19.292l-2.977,0.341l-0.541,0.448l-1.479,1.195l1.316,4.489l-2.284,3.395l-2.514,1.264l-5.484-4.532l-3.088-0.894l-0.807,1.901l2.221,7.178l-3.4,1.389l-8.363-0.13l-1.511,2.2l1.102,5.365l-0.688,2.773l-3.138,3.165l-6.603,2.8l-3.896,4.188l-4.629-1.324l-4.731,0.617l-5.092-2.584l-2.625,3.567l0.473,2.713l0.18,1.026l-1.312,1.687l-12.452,4.766l-4.598,4.485l-7.062,11.067l-17.623,19.809l-4.092,1.727l-4.498-0.617l-3.646-3.184l-2.795-6.517l-7.176-8.867l-1.233-0.556l-3.515-1.644l-1.904-3.632l1.349-5.387l-3.271-4.059l-7.015-5.512l-2.891,1.794l-4.023,0.47l-2.873-1.729l-1.267-5.555l4.799-8.354l-0.082-1.601l-2.528-4.895l-8.02-9.614l-5.352-4.166l-4.615-1.837l-4.221,0.642l-6.785-0.771l-4.813-0.574l-6.946,2.627l-3.006,4.059l-1.922,0.255l-14.568-7.837l-4.862-0.621l-8.46,1.837l-8.489-0.983l-4.207,0.664l-7.718,4.167l-3.515,0.682l-2.908-1.195l-4.812-4.683l-4.157-0.553l-7.273,1.432l-1.642-0.682l-1.363-4.127l-4.898-3.075l-3.199-5.279l-11.401-8.885l-5.222-7.159l-3.088-7.565l-0.409-5.831l3.611-12.671l0.133-5.811l-1.169-4.468l-5.846-8.418l-3.037-6.449l-2.317-4.938l1.363-2.753l3.775-2.096l2.992-7.414l4.4-3.994l2.104-3.761l-4.024-9.915l-3.844-6.729l-8.346-7.647l-8.769-2.588l-9.429-10.342l-4.257-2.325l-5.318-5.386l-7.262-1.945l-0.671-0.168l-5.175-1.393l-2.956,0.56l-2.857,0.553l-2.924-1.048l-3.944,2.096l-2.3,4.123l0.147,1.432l0.087,0.682l3.938,5.149l-2.396,2.523l-10.888-5.685l-4.207,0.151l-5.993,11.663l-4.092,3.829l-6.717-0.833l-9.921,3.266l-7.652,2.522l-2.776,3.033l-0.297,2.454l3.303,4.041l-3.023,1.091l-0.592,1.367v7.048l-6.882,15.704l-2.776,10.256l1.202,4.102l-0.825,2.609l-12.315-5.193l-8.758-6.431l-5.043,2.907l-0.886,0.488l1.481-5.211l-1.61-6.409l2.02-5.556l-0.919-2.67l-4.436,1.367l-4.681-0.6l-3.073-4.912l-1.345-4.637l1.18-2.949l2.895-1.967l7.011-0.703l1.643-1.328l-0.262-1.77l-7.345-3.549l-6.47-10.363l-6.126,0.043l-4.598,5.066l-3.564,0.873l-4.748,1.176l-0.592-2.135l1.051-3.825l-1.083-2.864l-3.285-0.706L64.375,328l-2.597,6.753l-4.698,3.291l-4.859-0.577l0.707-3.848l-1.102-2.351l-3.17,0.384l-3.171-3.158l-4.041,4.379l-3.152,0.211l-1.644-2.368l2.611-3.229l8.543-3.459l3.446-2.817l-0.115-1.242l-1-0.75l-2.693,1.263l-5.387-0.431l-2.185-2.239l-10.644-10.898l-0.592-2.135l1.707-6.603l-0.574-2.498l-3.529-2.993l-0.609-2.157l3.694-7.737l2.302-0.596l2.712-5.516l9.181-9.42l8.571,0.065l11.627-5.599l5.835-4.999l1.854-2.778l3.235-4.895l5.831-4.654l12.893-6.413l7.13-6.345l5.089-7.306l5.717-2.372l5.831-8.333l3.285-2.842l7.488-2.971l4.863-6.086l3.203-1.263l10.167,1.367l6.671-1.751l5.057-3.438l14.98-12.287l4.088-8.247l14.044-14.616l6.667-10.744l4.01,3.912l4.483-1.902l5.308-4.486l1.79-4.213l6.157-14.401l4.827-1.855l6.408,4.913l2.594-2.864l-0.738-5.853l0.674-2.968l21.963-17.885l5.039-2.734l5.799,3.312l3.367-0.875l3.533-3.696l1.808-5.257l0.459-1.324l3.299,0.707l1.414-10.493l1.821-1.324l4.666,1.303l4.465-1.346l6.556,2.113l-0.197-2.049l-0.114-1.238l-0.032-0.258l1.707-2.541l0.444,0.064l9.819,1.518h0.018l6.817-2.29l5.86-1.963l7.098-8.25l8.36-2.2l4.532-2.759l4.501-5.767l2.481-3.183l8.163-5.21l4.992,2.027l4.418-3.972l4.057-0.496l4.913-2.903l8.475-10.809l2.775,0.682l3.383,3.61l1.89,2.031l2.363,2.519l8.643-0.768l15.602-12.348l4.812-2.458l11.071-5.663l3.712-0.147l-0.478,5.447l1.891,0.79l5.767-2.669l3.611,1.259l-2.726,4.956l0.147,3.527l3.712-0.323l17.673-11.512l2.317-0.578l2.005,1.687l-0.986,2.074l0.408,1.966l11.352-1.841l4.354-2.584l1.707-2.372l4.383-6.086l7.147-5.236l12.434-5.473l4.565-0.086l0.969,1.453l-1.707,2.376l0.771,1.984l4.056-0.298l13.847-5.728l2.234,1.005l-4.089,3.994l-2.334,6.901l-2.185,1.475l-3.482-0.556l-3.221,1.044l-8.916,6.861l-6.684,5.128l-3.781,1.73l-11.396-0.298l-5.946,5.663l-3.253,4.744l-4.254,1.005l-0.179,9.312l-7.621-8.182l-4.749,0.276l-3.743,4.191l-1.234,6.449l1.743,9.617l2.808,6.492l1.872,4.339l7.048,5.681l9.378-1.238l7.112-5.063l2.299-0.233l2.876,1.92l2.987-0.168l3.877-3.309l9.296-2.993l4.909-3.248l5.85-7.242l3.103-2.117l4.06-0.129l3.399,1.967l-9.625,8.781l-0.312,0.983l-1.825,5.767l0.889,3.058l2.317,2.411l3.006-0.362l0.344,3.208l-4.056,3.459l-6.506,9.51l-4.007,2.752l-7.703-0.255l-6.685,3.506l-3.304-0.56l-2.463-3.118l-3.383-2.135l-1.939,0.254l-2.956,2.648l-2.233,5.344l-1.955,6.922l0.545,2.691l0,0l3.842,13.077l8.048,15.962l6.438,7.22l13.323,9.402l22.548,10.253l0.627,1.263l11.545,5.62l5.34,2.583l5.175,1.536l3.874-0.488l5.454-3.376L573.58,174.211z M387.517,601.973l-2.759-3.696l0.459-1.902l2.138-1.13l0.327-2.975l2.514-1.45l3.809,0.556l0.427,1.622l-2.28,7.095l-2.056,2.541l0,0L387.517,601.973z M365.657,614.346l3.909,11.491l2.217,0.663l0.982-2.07l-0.244-0.771l-1.083-3.523l0.638-2.438l2.598,0.302l2.789,3.158l3.093,0.707l2.248-3.058l-1.99-5.211l0.66-2.437l2.625-0.384l4.716,2.885l6.011,1.217l2.335,1.902l-4.634,5.555l-4.171-0.236l-1.478,1.858l-0.84,2.608l2.465,2.605l-3.203,4.766l0.083,1.773l3.528,5.469l-0.588,1.22l-2.449,0.384l-5.993-1.751l-6.193,1.963l0,0l-0.28-4.425l-8.539,0.409l-0.444-1.432l3.386-4.744l-0.789-1.622l-6.85-1.794l-0.625-4.615l4.96-5.021l-2.514-1.901l-0.409-2.136l1.492-2.031L365.657,614.346z\"/>\n			<path id=\"outer-border\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2\" d=\"M19.058,281.596l1.891,0.793l-1.629,5.021l-5.286,4.504l-4.354,7.012l-3.088-1.198l-2.234,2.885l-2.382-1.177l7.292-10.041L19.058,281.596z M689.455,193.888l2.102-3.054l-0.903-2.519l-2.347-1.54l-7.395,0.427l-0.854-0.958l-1.441-1.647l0.229-3.869l5.336-10.428l-0.409-1.963l-1.989-1.88l-6.373,1.22l-6.305-0.215l-5.832-4.916l-7.768-2.221l-4.418-5.211l-3.057-1.949l-11.482-1.367l-2.892-1.575l-2.693-4.917l-11.906-9.165l-4.271-2.01l-5.057,2.523l-1.445,3.973l1,6.922l-1.56,5.555l-5.354,4.809l-8.901,2.479l-19.89,13.82l-6.309,0.172l-5.454,3.376l-3.874,0.488l-5.175-1.536l-5.34-2.583l-11.545-5.62l-0.627-1.263l-22.548-10.253l-13.323-9.402l-6.438-7.22l-8.048-15.962l-3.842-13.077l-0.545-2.691l1.955-6.922l2.233-5.344l2.956-2.648l1.939-0.254l3.383,2.135l2.463,3.118l3.304,0.56l6.685-3.506l7.703,0.255l4.007-2.752l6.506-9.51l4.056-3.459l-0.344-3.208l-3.006,0.362l-2.317-2.411l-0.889-3.058l1.825-5.767l0.312-0.983l9.625-8.781l-3.399-1.967l-4.06,0.129l-3.103,2.117l-5.85,7.242l-4.909,3.248l-9.296,2.993l-3.877,3.309l-2.987,0.168l-2.876-1.92l-2.299,0.233l-7.112,5.063l-9.378,1.238l-7.048-5.681l-1.872-4.339l-2.808-6.492l-1.743-9.617l1.234-6.449l3.743-4.191l4.749-0.276l7.621,8.182l0.179-9.312l4.254-1.005l3.253-4.744l5.946-5.663l11.396,0.298l3.781-1.73l6.684-5.128l8.916-6.861l3.221-1.044l3.482,0.556l2.185-1.475l2.334-6.901l4.089-3.994l-2.234-1.005l-13.847,5.728l-4.056,0.298l-0.771-1.984l1.707-2.376l-0.969-1.453l-4.565,0.086l-12.434,5.473l-7.147,5.236l-4.383,6.086l-1.707,2.372l-4.354,2.584l-11.352,1.841l-0.408-1.966l0.986-2.074l-2.005-1.687l-2.317,0.578l-17.673,11.512l-3.712,0.323l-0.147-3.527l2.726-4.956l-3.611-1.259l-5.767,2.669l-1.891-0.79l0.478-5.447l-3.712,0.147l-11.071,5.663l-4.812,2.458l-15.602,12.348l-8.643,0.768l-2.363-2.519l-1.89-2.031l-3.383-3.61l-2.775-0.682l-8.475,10.809l-4.913,2.903l-4.057,0.496l-4.418,3.972l-4.992-2.027l-8.163,5.21l-2.481,3.183l-4.501,5.767l-4.532,2.759l-8.36,2.2l-7.098,8.25l-5.86,1.963l-6.817,2.29h-0.018l-9.819-1.518l-0.444-0.064l-1.707,2.541l0.032,0.258l0.114,1.238l0.197,2.049l-6.556-2.113l-4.465,1.346l-4.666-1.303l-1.821,1.324l-1.414,10.493l-3.299-0.707l-0.459,1.324l-1.808,5.257l-3.533,3.696l-3.367,0.875l-5.799-3.312l-5.039,2.734l-21.963,17.885l-0.674,2.968l0.738,5.853l-2.594,2.864l-6.408-4.913l-4.827,1.855l-6.157,14.401l-1.79,4.213l-5.308,4.486l-4.483,1.902l-4.01-3.912l-6.667,10.744l-14.044,14.616l-4.088,8.247l-14.98,12.287l-5.057,3.438l-6.671,1.751l-10.167-1.367l-3.203,1.263l-4.863,6.086l-7.488,2.971l-3.285,2.842l-5.831,8.333l-5.717,2.372l-5.089,7.306l-7.13,6.345L80.471,244.4l-5.831,4.654l-3.235,4.895l-1.854,2.778l-5.835,4.999l-11.627,5.599l-8.571-0.065l-9.181,9.42l-2.712,5.516l-2.302,0.596l-3.694,7.737l0.609,2.157l3.529,2.993l0.574,2.498l-1.707,6.603l0.592,2.135l10.644,10.898l2.185,2.239l5.387,0.431l2.693-1.263l1,0.75l0.115,1.242l-3.446,2.817l-8.543,3.459l-2.611,3.229l1.644,2.368l3.152-0.211l4.041-4.379l3.171,3.158l3.17-0.384l1.102,2.351l-0.707,3.848l4.859,0.577l4.698-3.291L64.375,328l2.841-0.919l3.285,0.706l1.083,2.864l-1.051,3.825l0.592,2.135l4.748-1.176l3.564-0.873l4.598-5.066l6.126-0.043l6.47,10.363l7.345,3.549l0.262,1.77l-1.643,1.328l-7.011,0.703l-2.895,1.967l-1.18,2.949l1.345,4.637l3.073,4.912l4.681,0.6l4.436-1.367l0.919,2.67l-2.02,5.556l1.61,6.409l-1.481,5.211l0.886-0.488l5.043-2.907l8.758,6.431l12.315,5.193l0.825-2.609l-1.202-4.102l2.776-10.256l6.882-15.704v-7.048l0.592-1.367l3.023-1.091l-3.303-4.041l0.297-2.454l2.776-3.033l7.652-2.522l9.921-3.266l6.717,0.833l4.092-3.829l5.993-11.663l4.207-0.151l10.888,5.685l2.396-2.523l-3.938-5.149l-0.087-0.682l-0.147-1.432l2.3-4.123l3.944-2.096l2.924,1.048l2.857-0.553l2.956-0.56l5.175,1.393l0.671,0.168l7.262,1.945l5.318,5.386l4.257,2.325l9.429,10.342l8.769,2.588l8.346,7.647l3.844,6.729l4.024,9.915l-2.104,3.761l-4.4,3.994l-2.992,7.414l-3.775,2.096l-1.363,2.753l2.317,4.938l3.037,6.449l5.846,8.418l1.169,4.468l-0.133,5.811l-3.611,12.671l0.409,5.831l3.088,7.565l5.222,7.159l11.401,8.885l3.199,5.279l4.898,3.075l1.363,4.127l1.642,0.682l7.273-1.432l4.157,0.553l4.812,4.683l2.908,1.195l3.515-0.682l7.718-4.167l4.207-0.664l8.489,0.983l8.46-1.837l4.862,0.621l14.568,7.837l1.922-0.255l3.006-4.059l6.946-2.627l4.813,0.574l6.785,0.771l4.221-0.642l4.615,1.837l5.352,4.166l8.02,9.614l2.528,4.895l0.082,1.601l-4.799,8.354l1.267,5.555l2.873,1.729l4.023-0.47l2.891-1.794l7.015,5.512l3.271,4.059l-1.349,5.387l1.904,3.632l3.515,1.644l1.233,0.556l7.176,8.867l2.795,6.517l3.646,3.184l4.498,0.617l4.092-1.727l17.623-19.809l7.062-11.067l4.598-4.485l12.452-4.766l1.312-1.687l-0.18-1.026l-0.473-2.713l2.625-3.567l5.092,2.584l4.731-0.617l4.629,1.324l3.896-4.188l6.603-2.8l3.138-3.165l0.688-2.773l-1.102-5.365l1.511-2.2l8.363,0.13l3.4-1.389l-2.221-7.178l0.807-1.901l3.088,0.894l5.484,4.532l2.514-1.264l2.284-3.395l-1.316-4.489l1.479-1.195l0.541-0.448l2.977-0.341l8.062-19.292l4.731-6.604l1.692-5.021l-1.822-4.848l1.396-3.272l1.624-0.962l4.125,4.468l1.725,0.276l1.033-2.95l-0.721-8.842l3.202-22.393l2.02-5.107l4.896-12.287l-0.294-3.908l4.827-8.182l5.78-6.542l3.351-6.663l8.938-6.539l5.354-7.967l11.989-7.758l3.909-1.173l3.68-3.312l1.478-4.313l-0.609-4.446l-0.129-0.897l2.661-3.718l2.546-1.622l7.851,0.129l2.693-1.095l1.937-3.395l-1.478-1.69l-4.386,0.28l-1.64-1.859l-3.22-10.597l3.284-11.599l7.438-16.497l2.711-1.604l4.011,0.405l8.341,3.847l2.102,0.129l1.495-1.665l0.363-2.868l0.605-4.827l-1.032-6.237l2.019-4.468l1.758-0.254l6.785,3.757l0.982-1.88l-2.166-16.687l0.739-3.843l2.019-1.45l-0.015-2.846l-3.073-4.231l-0.344-3.183l2.169-7.116L689.455,193.888z M392.151,601.092l2.28-7.095l-0.427-1.622l-3.809-0.556l-2.514,1.45l-0.327,2.975l-2.138,1.13l-0.459,1.902l2.759,3.696l2.578,0.66L392.151,601.092z M388.815,613.66l-4.716-2.885l-2.625,0.384l-0.66,2.437l1.99,5.211l-2.248,3.058l-3.093-0.707l-2.789-3.158l-2.598-0.302l-0.638,2.438l1.083,3.523l0.244,0.771l-0.982,2.07l-2.217-0.663l-3.909-11.491l-2.582-0.664l-1.492,2.031l0.409,2.136l2.514,1.901l-4.96,5.021l0.625,4.615l6.85,1.794l0.789,1.622l-3.386,4.744l0.444,1.432l8.539-0.409l0.28,4.425l6.193-1.963l5.993,1.751l2.449-0.384l0.588-1.22l-3.528-5.469l-0.083-1.773l3.203-4.766l-2.465-2.605l0.84-2.608l1.478-1.858l4.171,0.236l4.634-5.555l-2.335-1.902L388.815,613.66z\"/>\n			<g id=\"map-dots\" transform=\"translate(78.000000, 140.000000)\">\n				<g id=\"deia\">\n					<path id=\"dub\" data-parent-id=\"deia\" fill=\"none\" stroke=\"#000000\" d=\"M132.5,26c1.933,0,3.5-1.567,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.567-3.5,3.5S130.567,26,132.5,26z\"/>\n					<path id=\"mateo\" data-parent-id=\"deia\" fill=\"none\" stroke=\"#000000\" d=\"M149.5,8c1.933,0,3.5-1.567,3.5-3.5S151.433,1,149.5,1c-1.934,0-3.5,1.567-3.5,3.5S147.567,8,149.5,8z\"/>\n				</g>\n				<g id=\"es-trenc\">\n					<path id=\"isamu\" data-parent-id=\"es-trenc\" fill=\"none\" stroke=\"#000000\" d=\"M328.5,320c1.933,0,3.5-1.567,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.567-3.5,3.5S326.567,320,328.5,320z\"/>\n					<path id=\"beluga\" data-parent-id=\"es-trenc\" fill=\"none\" stroke=\"#000000\" d=\"M346.5,347c1.933,0,3.5-1.567,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.567-3.5,3.5S344.567,347,346.5,347z\"/>\n				</g>\n				<g id=\"arelluf\">\n					<path id=\"capas\" data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M43.5,233c1.933,0,3.5-1.566,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.566-3.5,3.5S41.567,233,43.5,233z\"/>\n					<path id=\"pelotas\" data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M50.5,212c1.933,0,3.5-1.566,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.566-3.5,3.5S48.567,212,50.5,212z\"/>\n					<path id=\"marta\" data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M57.5,186c1.933,0,3.5-1.566,3.5-3.5c0-1.933-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.567-3.5,3.5C54,184.434,55.567,186,57.5,186z\"/>\n					<path id=\"kobarah\" data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M29.5,195c1.933,0,3.5-1.566,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.566-3.5,3.5S27.567,195,29.5,195z\"/>\n					<path id=\"dub\" data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M29.5,172c1.933,0,3.5-1.567,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.567-3.5,3.5S27.567,172,29.5,172z\"/>\n					<path id=\"paradise\" data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M4.5,183c1.933,0,3.5-1.567,3.5-3.5S6.433,176,4.5,176c-1.934,0-3.5,1.567-3.5,3.5S2.567,183,4.5,183z\"/>\n				</g>\n			</g>\n			<path id=\"fleves\" fill=\"none\" stroke=\"#FFFFFF\" d=\"M304.534,122.281c0.334-0.44,0.564-0.979,1.033-1.3c0.851-1.096,1.631-2.247,2.528-3.305c0.343-0.397,0.983-0.725,1.448-0.336c0.094,0.34-0.629,0.638-0.163,0.98c0.132,0.233,0.845,0.167,0.344,0.321c-0.462,0.189-0.933,0.407-1.241,0.815c-0.932,0.955-1.419,2.232-1.801,3.487c-0.51,0.431,0.515,1.184,0.675,0.462c0.151-0.318,0.782-0.085,0.389,0.203c-0.38,0.458-0.358,1.116,0.116,1.472c0.208,0.498-0.372,0.771-0.759,0.534c-0.654-0.081-0.986,0.557-1.487,0.818c-0.596,0.354-1.056-0.258-1.563-0.466c-0.403-0.152-0.691-0.687-0.128-0.835c0.368-0.106,0.234-0.634-0.146-0.386c-0.526,0.245-1.215,0.152-1.543,0.662c-0.543,0.378-0.563-0.394-0.326-0.701c0.362-0.646,1.062-0.979,1.567-1.495C303.827,122.897,304.173,122.579,304.534,122.281L304.534,122.281z M283.701,138.906c1.044-0.792,2.087-1.583,3.131-2.375c0.192-0.282,0.875-0.576,0.952-0.08c0.079,0.29,0.325,0.684,0.677,0.537c0.123-0.22,0.667,0.038,0.286,0.125c-0.333,0.177-0.87,0.342-0.84,0.808c0.031,0.406,0.229,0.77,0.371,1.144c-0.298,0.511,0.124,1.121-0.15,1.638c-0.142,0.385-0.142,0.864-0.488,1.14c-0.423,0.13-0.938-0.17-1.297,0.176c-0.398,0.259-0.798-0.128-1.184-0.214c-0.522-0.137-1.07-0.112-1.599-0.031c-0.356-0.234-0.831-0.135-1.129,0.05c-0.477-0.113-0.533,0.481-0.782,0.712c-0.093-0.158,0.131-0.503,0.238-0.697c0.144-0.243,0.369-0.423,0.536-0.644c0.165-0.382,0.362-0.825,0.82-0.9c0.403-0.212,0.225-0.735,0.1-0.995C283.436,139.144,283.629,139.076,283.701,138.906L283.701,138.906z M297.55,83.896c0.746,0.277,1.492,0.555,2.237,0.832c0.159,1.279,1.932,0.445,2.162,1.724c0.612,0.867,1.919,0.071,2.801,0.498c1.061,0.136,1.478,1.158,2.083,1.892c0.679,0.894,1.362,1.786,1.969,2.731c1.237-0.703,1.542,0.568,2.094,1.425c1.229,0.916,2.482,1.802,3.788,2.605c0.685,0.865,1.07,1.78,2.354,1.509c0.913-0.189,1.71-0.668,2.681-0.198c1.006-0.136,2.072-0.394,2.132-1.537c1.18,0.278,2.158-0.068,2.964-0.957c1.196-0.236,1.326-1.349,1.947-2.15c0.434-0.2,0.907-0.315,1.349-0.505 M315.643,96.947c-0.363,0.977-0.806,1.962-1.564,2.699c-0.433,0.811,0.32,2.203-0.908,2.524c-0.792,0.21-1.176,0.857-1.333,1.619c-0.074,0.902-1.259,0.779-1.542,1.495c-0.242,0.633-0.484,1.266-0.726,1.898c0.389,0.845,0.449,1.962-0.566,2.354c-0.539,0.861-0.148,1.937-0.132,2.87c0.279,0.792,1.251,1.14,1.421,1.977c-0.144,0.986-1.393,1.245-1.8,2.091c-0.104,0.213-0.143,0.454-0.137,0.689 M301.45,125.288c-1.67,1.749-3.197,3.625-4.796,5.438c-0.748,0.214-1.708,0.059-2.23,0.761c-0.409,0.34-0.707,0.853-1.194,1.073c-0.755,0.199-1.51,0.398-2.265,0.597c-0.623,1.237-1.267,2.472-2.082,3.596c-0.158,0.06-0.317,0.119-0.476,0.179 M281.311,143.072c-0.717,0.884-1.784,1.405-2.875,1.66c-0.532,0.401,0.158,1.25-0.463,1.655c-0.642,0.872-1.465,1.625-2.451,2.081c-1.133,0.81-2.206,1.791-2.79,3.08c-0.229,0.395-0.458,0.791-0.691,1.184 M178.088,316.694l-0.861,0.761l-0.331-0.42l-0.401-0.02l-0.733-0.441l-1.114-0.828l-0.402-0.021l-1.154-0.06l-0.753-0.057l-0.382-0.42l-1.115-0.812l-1.097-0.878l-1.115-0.811l-2.209-2.04l0.85-1.512l0.794-0.711l0.9-1.512l3.221-2.527l1.616-1.071l1.985-1.035l-0.312-0.771l-1.095-1.229l-0.767-0.441l-1.134-0.478l-0.382-0.371l-1.172-0.061l-1.449-0.897l-0.401-0.021l-0.713-0.791l-1.114-0.878l-1.136-0.411l-1.135-0.461l-0.782-0.458l-1.557-0.081l-0.714-0.808l0.83-1.095l0.021-0.417l0.04-0.751l0.422-0.364l0.422-0.33l0.422-0.38l-0.345-0.771l-0.382-0.438l-0.401-0.02l-0.733-0.44l-0.401-0.02l-1.154-0.077l-0.332-0.37l-0.401-0.021l-0.773,0.311l-0.418-0.021l-0.382-0.371l-0.717-0.457l0.021-0.4l-0.342-1.172l-0.291-1.171l0.037-0.4l0.02-0.351l0.371-0.381l0.422-0.38l2.005-1.402l0.844-0.744l1.645-2.223l0.401,0.02l1.155,0.06l1.154,0.077l0.02-0.401l0.021-0.35l1.231-1.091l0.402,0.02l0.441-0.781l0.811-0.711l0.422-0.363l0.392-0.731l0.422-0.38l0.772-0.311l0.402,0.02l0.401,0.02l0.389-0.38l0.039-0.751l0.442-0.781l0.459-0.73l0.338-0.348l0.067-0.016l0.85-1.496l-0.308-1.171l-0.345-0.805l0.02-0.384l0.061-1.152l0.058-0.768l0.04-0.768l-0.365-0.42l-0.385-0.02l-0.405,0.364l-0.385-0.02l-0.345-0.788l-0.385-0.02l0.02-0.384l-0.749-0.44l-0.365-0.404l-0.385-0.02l-0.807,0.344l-0.349-0.404l-0.401-0.037l-0.77-0.04l-0.386-0.021l-0.404,0.364l-0.386-0.021l-0.404,0.364l-0.365-0.404l-0.385-0.037l0.02-0.384l-0.385-0.02l-0.385-0.02l-0.385-0.02l0.02-0.384l-0.385-0.021l0.02-0.384l-0.385-0.02l-0.364-0.42l0.385,0.037l-0.365-0.42l-0.345-0.788l-0.749-0.424l-0.386-0.02l-0.364-0.421l-0.345-0.788l0.02-0.384l0.021-0.384l0.036-0.384l-0.364-0.404l0.02-0.384l-0.364-0.421l0.425-0.748l-0.365-0.404l1.135,0.46l1.191-0.323l0.021-0.384l0.83-1.111l-1.499-0.865l0.04-0.768l0.036-0.384l3.217-2.143l2.427-1.782l0.04-0.768l0.422-0.364l0.485-1.916l0.021-0.384l0.441-0.748l0.157-2.687l2.832-2.163l0.386,0.02l1.154,0.077l0.385,0.02l0.75,0.424l0.385,0.02l1.172,0.077l0.75,0.424l0.385,0.021l1.54,0.097l0.385,0.02l0.02-0.384l0.021-0.384l0.137-2.32l-0.345-0.788l1.577-0.303l0.385,0.02l0.77,0.057l0.365,0.404l0.365,0.404l1.904,0.501l1.557,0.081l0.364,0.42l0.75,0.424l0.385,0.02l1.561-0.304l0.749,0.44l0.346,0.788l2.979,2.097l0.75,0.44l0.75,0.424l1.52,0.48l1.52,0.464l1.172,0.077l1.194-0.708l1.135,0.444l0.771,0.057l0.847-1.111l0.79-0.344l0.385,0.02l0.385,0.02l0.385,0.02l0.386,0.02l0.749,0.441l-1.037-1.997l-0.71-1.208l-0.345-0.788l0.807-0.344l1.58-0.671l0.405-0.364l1.191-0.323v-0.017l1.985-1.034l2.002-1.035l1.597-0.688l0.729,0.825l0.77,0.04l2.31,0.137l1.172,0.061l0.365,0.404l0.713,0.825l3.056,0.945l1.135,0.444l3.81,1.001l2.326,0.137l1.155,0.06l0.77,0.041l1.922,0.501l0.77,0.04l2.289,0.521l1.155,0.06l-0.02,0.384l2.306,0.521l1.54,0.097l0.79-0.344l0.405-0.364l1.231-1.091l1.617-1.071l0.81-0.711l0.811-0.728l0.422-0.363l0.404-0.364l2.022-1.435l0.385,0.02l0.811-0.728l0.826-0.728l2.351-0.63l1.576-0.304l1.114,0.845l0.771,0.04l1.539,0.097l0.386,0.02l0.036-0.384l-0.689-1.592l-0.146-4.26l0.02-0.384l-0.572-3.512l-0.552-3.896l-0.592-3.128l0.02-0.384l0.037-0.384l-0.877-5.067l0.385,0.021l1.657-1.839l-0.288-1.572l-1.439-2l-1.074-1.612l0.968-3.432l0.907-2.263l1.191-0.323l0.888-1.879l0.851-1.495l0.847-1.112l1.56-0.287l0.867-1.496l2.31,0.121l0.827-0.711l0.445-1.148l0.462-1.131l0.405-0.364l0.02-0.384l0.426-0.748l0.421-0.364l0.021-0.384l0.79-0.344l0.405-0.364l0.02-0.384l0.422-0.364l0.385,0.037l0.385,0.021l0.831-1.112l0.826-0.728l0.405-0.364l0.405-0.364l0.405-0.364l0.807-0.344l0.79-0.344l0.77,0.057l0.79-0.344l0.75,0.424l0.385,0.02l0.787,0.04l0.385,0.037l0.445-1.148l2.771-0.995l0.02-0.384l-0.385-0.02l0.021-0.384l0.02-0.384l0.021-0.384l13.246-7.749l0.404-0.364l0.021-0.384l-0.385-0.02l-0.365-0.404l-0.385-0.02l-0.365-0.421l-0.345-0.788l-0.364-0.404l-0.75-0.424l0.02-0.384l-0.327-0.804l-0.365-0.404l0.02-0.384l-0.385-0.02l-0.385-0.02l-0.385-0.02l-0.385-0.037l0.02-0.384l-0.385-0.021l-0.365-0.404l-0.385-0.02l-0.364-0.404l-0.386-0.02l-0.401-0.037l-0.348-0.404l-0.402-0.02l-0.385-0.02l0.021-0.384l0.036-0.384l0.79-0.344l0.021-0.384l0.425-0.748l0.807-0.343l0.426-0.748l0.02-0.384l0.848-1.111l0.04-0.768l0.404-0.364l0.021-0.384l0.021-0.384l0.481-1.532l0.405-0.347l0.405-0.364l0.422-0.363l0.02-0.384l0.021-0.4l0.404-0.347l0.405-0.364l0.021-0.401l0.441-0.748l0.811-0.711l0.79-0.344l-0.652-1.976l-0.71-1.192l2.042-1.819l0.364,0.404l0.73,0.808l0.749,0.44l0.365,0.404l-0.02,0.384l0.385,0.02l-0.021,0.384l-0.02,0.384l0.385,0.02l0.364,0.421l-0.02,0.384l-0.037,0.384l0.402,0.021l0.385,0.02l0.75,0.424l-0.021,0.4l0.692,1.192l-0.02,0.384l-0.021,0.384l-0.02,0.384l0.385,0.021l-0.02,0.384l0.385,0.037l0.364,0.404l0.771,0.04l0.385,0.02l1.175-0.307l2.347-0.263l0.481-1.515l0.385,0.02l1.58-0.671l0.385,0.02l0.808-0.344l0.385,0.02l0.385,0.02l0.83-1.111l0.422-0.364l0.425-0.748l0.405-0.364l0.79-0.344l0.422-0.363l0.79-0.327l2.002-1.051l1.697-2.607l0.445-1.131l0.441-0.748l1.195-0.708l0.75,0.424l1.191-0.307l1.58-0.688l0.462-1.131l1.601-1.071l0.421-0.364l1.235-1.476l0.386,0.021l0.441-0.748l1.6-1.055l2.043-1.819l0.807-0.344l0.425-0.748l0.061-1.152l0.462-1.131l0.79-0.344l0.827-0.728l1.56-0.304l2.103-2.971l1.557,0.097l1.215-1.091l0.847-1.111l0.771,0.04l1.596-0.671l0.426-0.748l2.812-1.779l0.848-1.111l0.81-0.728l0.021-0.384l2.427-1.782l1.191-0.324l0.425-0.748l5.099-0.874l1.925,0.117l1.944-0.284l2.691,0.542l0.77,0.057l1.079,1.596l1.194-0.691l1.212-0.708l1.195-0.708l0.462-1.131l2.33-0.247l3.177-1.375l2.286,0.905l1.984-1.035l1.272-1.859l0.77,0.04l1.598-0.687l1.175-0.307l4.388-2.066l2.387-1.031l3.157-0.975l0.77,0.04l1.232-1.091l0.79-0.327l1.579-0.688l0.422-0.364l1.216-1.091l2.347-0.247l2.151,2.824l4.034,4.093l0.729,0.825l1.459,1.632l2.882,3.632l1.212-0.69l0.425-0.748l2.022-1.435l2.387-1.031l2.427-1.782l2.021-1.436l0.365,0.404l0.729,0.824l1.135,0.444l1.095,1.229l1.114,0.828l0.79-0.327l0.385,0.02l1.155,0.06l1.845,1.652l1.114,0.845l1.657-1.839l0.887-1.879l0.061-1.168l0.021-0.384l0.02-0.384l-0.365-0.404l0.037-0.384l0.021-0.384l0.02-0.384l0.385,0.02l0.021-0.384l0.02-0.384l0.442-0.748l0.02-0.384l0.041-0.785l0.061-1.151l0.385,0.02l0.036-0.384l0.041-0.768l-0.365-0.404l-0.345-0.788l-0.248-2.34l0.486-1.899l-0.613-2.744l-0.268-1.956l0.405-0.364l0.385,0.037l0.385,0.02l0.021-0.384l0.385,0.02l0.422-0.364l0.385,0.02l0.04-0.768l0.405-0.364l2.635,1.309l0.405-0.364l0.866-1.495l0.021-0.384l0.02-0.384l0.462-1.131l0.021-0.384l0.385,0.02l0.771,0.04l0.385,0.02l0.385,0.02l0.021-0.384l0.401,0.02l0.405-0.364l0.425-0.748l0.425-0.748l0.422-0.363l0.83-1.112l1.212-0.69l0.83-1.112l0.021-0.4l1.252-1.458l0.405-0.364l0.02-0.4l0.827-0.711l0.79-0.344l1.271-1.859l0.848-1.111l0.79-0.344l1.58-0.688l0.807-0.343 M480.888,115.824l-2.139,0.559l-2.762,0.562l-0.77-0.053l-0.384-0.027l-0.428,0.356l-0.027,0.384l-0.411,0.356l-0.411,0.357l-0.796,0.33l-0.785-0.07l-0.027,0.383l-0.796,0.33l-2.815,1.346l-1.18,0.286l-1.609,0.659l-0.411,0.357l-2.484,2.14l-0.84,0.713l-0.026,0.384l1.073,1.23l0.357,0.411l2.103,2.878l1.457,1.274l-0.438,0.74l-0.769-0.07l-1.609,0.659l-1.618,1.043l-0.812,0.329l-1.207,0.67l-0.839,0.713l-0.823,0.713l-1.251,1.069l-0.822,0.713l-0.411,0.357l-0.411,0.356l-1.251,1.07l-1.251,1.053l-0.849,1.097l-0.84,0.713l-0.026,0.383l-0.412,0.357l-0.054,0.784l-0.866,1.096l-0.026,0.384l-0.438,0.74l-0.026,0.383l-0.044,0.383l-0.519,1.891l-0.026,0.384l0.287,1.193l-0.054,0.767l-0.027,0.383l-0.026,0.384l-0.455,0.739l-0.822,0.714l-0.438,0.74l-0.026,0.383l-0.429,0.356l-0.026,0.384l-0.026,0.383l-0.85,1.097l-0.429,0.356l-0.053,0.767l-0.465,1.124l-0.385-0.027l-0.429,0.356l-1.18,0.303l-0.412,0.356l-0.384-0.026l-0.839,0.696l-0.823,0.714l-0.438,0.74l-0.428,0.356l-0.054,0.767l-0.054,0.784l-0.097,1.15l-0.027,0.383l-0.491,1.507l-0.429,0.356l-0.411,0.356l-0.385-0.027l-0.822,0.713l-0.812,0.33l-0.411,0.357l-0.027,0.383l-0.026,0.383l-0.054,0.767l-0.411,0.357l-0.894,1.479l-1.511-0.507l-2.654-0.972l-1.896-0.518l-0.769-0.07l0.027-0.383l-1.234,1.07l-3.271,2.085l-2.431,1.356l-3.281,2.47l-2.474,1.739l-1.977,0.633l-1.251,1.069l-1.564,0.26l-0.411,0.357l-0.812,0.33l-0.85,1.097l-1.358,2.604l-0.043,0.383l0.357,0.411l-0.026,0.383l-0.027,0.4l0.742,0.437l-0.026,0.383l-0.054,0.767l-0.481,1.123l-0.054,0.767l-0.466,1.14l-0.043,0.383l1.762,2.451l-0.027,0.384l1.377,2.425l0.699,0.82l-0.823,0.713l-1.207,0.687l-1.224,0.687l-1.207,0.67l-0.812,0.329l-0.026,0.384l0.688,1.221l0.358,0.41l-0.098,1.15l-0.438,0.74l-1.251,1.07l-0.438,0.74l-0.491,1.507l-0.044,0.383l-0.027,0.4l-0.026,0.384l-0.796,0.313l0.357,0.427l-0.384-0.027l-1.662,1.41l-0.509,1.523l-0.411,0.34l-0.92,1.88l-0.85,1.097l-1.716,2.193l-0.839,0.696l-0.796,0.33l-0.385-0.026l-0.796,0.33l-0.331-0.793l-0.098,1.15l-0.053,0.767l-0.027,0.384l-0.465,1.124l-0.455,0.74l-0.411,0.357l-0.411,0.356l-0.84,0.713l-0.796,0.33l-0.822,0.713l-0.688-1.221l0.796-0.313l-0.357-0.427l1.607-0.643l-0.276-1.578l-0.77-0.053l-1.592,0.66l0.341,0.41l-1.618,1.043l-0.795,0.313l-4.086-2.629l-0.411,0.356l-0.385-0.027l-0.357-0.41l-0.027,0.384l-0.796,0.33l-0.026,0.384l-0.385-0.027l-0.812,0.33l0.027-0.384l0.384,0.027l-0.741-0.454l-0.699-0.82l-1.1-0.864l-0.716-0.821l-1.457-1.274l-0.716-0.821l-1.1-0.864l-0.716-0.82l-0.661-1.604l-0.287-1.177l-0.662-1.604l-0.715-0.821l-1.636,1.043l-1.949,0.233l-1.224,0.686l-0.85,1.097l-1.197,0.303l-0.411,0.356l-1.207,0.67l-0.84,0.713l-0.384-0.027l-0.412,0.357l-0.384-0.027l-0.438,0.74l-0.742-0.437l-0.357-0.427l-0.385-0.027l-0.357-0.41l-0.358-0.41l-0.384-0.027l-0.027,0.383l-0.07,0.767l-0.411,0.356l-0.822,0.713l-0.455,0.74l-0.411,0.357l-0.027,0.383l-0.796,0.33l-0.428,0.356l-0.385-0.027l0.716,0.82l-0.876,1.48l0.645,1.604l-0.026,0.384l-0.742-0.454l-0.823,0.713l0.716,0.837l0.357,0.41l-1.197,0.303l-1.564,0.26l-0.77-0.053l-0.785-0.054l1.046,1.614l-0.822,0.713l-1.742,2.577l-0.482,1.124l0.357,0.427l-0.384-0.043l0.357,0.427l-0.411,0.356l-0.027,0.383l-0.043,0.383l-0.823,0.713l0.716,0.82l-0.866,1.097l-0.85,1.097l-0.742-0.437l-0.455,0.74l-1.868-0.917l-0.358-0.41l-0.411,0.356l-0.33-0.81l-0.796,0.33l-0.796,0.33l-0.385-0.027l-0.812,0.33l-0.716-0.837l-2.842,1.729l-0.358-0.41l-0.357-0.427l-0.715-0.821l-0.342-0.41l-1.072-1.248l-0.716-0.82l-0.715-0.837l-0.77-0.053l-1.153-0.081l-1.197,0.286l-0.384-0.027l-0.385-0.027l-1.538-0.107l-1.197,0.286l-0.796,0.33l-1.207,0.687l0.314,0.793l-1.207,0.687l-0.84,0.713l-0.026,0.384l-0.054,0.767l-0.385-0.026l-0.026,0.383l-1.225,0.686l-0.438,0.74l-0.823,0.713l-2.116,2.167l-0.385-0.044l-2.073,1.783l-0.822,0.713l-0.796,0.33l-0.429,0.356l-0.385-0.026l-2.403,0.973l1.403,2.041l0.358,0.41l0.276,1.578l-0.026,0.383l-1.555-0.124l-0.769-0.054l-0.77-0.054l-1.922-0.15l-0.401-0.027l-1.154-0.08l-1.537-0.124l-0.054,0.767l-0.124,1.55l0.153,3.094l-0.025,5.428l-0.106,1.534l0.304,1.177l1.153,0.097l-0.054,0.767l-1.25,1.07l0.715,0.82l0.742,0.454l1.484,0.874l-1.608,0.66l-4.407,1.989l1.54,5.151l2.809,4.066l0.384,0.043l1.691,3.218l0.411-0.356l0.044-0.383l0.054-0.767l0.054-0.783l0.027-0.384l0.384,0.043l0.385,0.027l0.384,0.027l0.358,0.41l-0.027,0.383l-0.026,0.384l0.385,0.026l0.455-0.739l0.411-0.357l0.438-0.74l0.411-0.356l0.027-0.384l0.401,0.027l0.026-0.383l0.357,0.41l-0.044,0.399l-0.026,0.384l0.786,0.054l0.385,0.027l-0.044,0.383l0.401,0.027l-0.044,0.383l-0.054,0.767l0.385,0.043l0.742,0.437l0.385,0.027l1.17,0.081l0.385,0.044l0.054-0.784l0.795-0.313l0.027-0.383l0.385,0.027l0.357,0.41l-0.411,0.356l-0.385-0.027l-0.026,0.384l-0.027,0.383l-0.026,0.384l0.385,0.027l0.411-0.357l0.385,0.027l0.304,1.194l0.384,0.027l0.385,0.026l0.385,0.027l0.385,0.027l-0.59,2.674l-0.919,1.863l0.812-0.329l0.341,0.41l0.357,0.41l0.716,0.837l1.02,1.998l0.715,0.837l0.646,1.587l0.276,1.577l1.154,0.081l-0.027,0.383l-0.204,2.701l-0.77-0.053l0.511,3.521l-3.093-0.231l-1.18,0.287l-1.949,0.25l-0.385-0.027l0.287,1.177l-0.026,0.383l-0.027,0.384l0.331,0.793l0.326,6.639l-4.709,5.84 M575.3,401.024l-0.386-0.021l-1.154-0.063l-4.935-1.848l-8.316-3.207l-0.363-0.422l-3.802-1.383l-1.518-0.486l-2.266-0.912l-8.697-3.613l-6.008-3.08l-3.741-2.166l-1.497-0.854l1.24-1.471l5.136-7.803l-7.781-5.89l-0.728-0.827l-0.342-0.789l-0.688-1.193l-0.705-1.211l-1.048-2l-1.009-2.385l0.043-0.768l-0.342-0.789l0.21-3.471l-0.792,0.342l-0.748-0.428l-0.727-0.826l-0.385-0.021l-1.54-0.086l-1.983,0.644l-0.791,0.341l-0.792,0.342l-4.25-0.27l-3.335-2.512l0.021-0.385l0.043-0.768l-0.385-0.037l0.021-0.385l0.466-1.129l0.043-0.768l0.043-0.768l-0.343-0.789l-0.748-0.443l-0.834,1.107l-1.475-1.236l-1.134-0.465l-0.342-0.789l1.235-1.087l-2.929-2.892l-1.62,1.066l-0.77-0.043l-0.363-0.406l-0.343-0.805l-1.111-0.832l-2.84,2.136l1.433,2.021l-0.915,2.26l-0.363-0.405l-0.363-0.404l-0.364-0.406l-1.795-2.426l-0.385-0.021l-0.363-0.422l-0.364-0.406l-1.475-1.253l0.423-0.362l0.812-0.708l-0.363-0.422l-0.363-0.405l-0.363-0.405l-0.385-0.021l-0.813,0.725l-1.171-0.081l-1.561,0.299l0.064-1.152l0.021-0.383l-0.261-1.957l-0.77-0.043l-1.539-0.103l-0.401-0.021l-2.891-3.274l-2.651-0.936l-4.144-2.171l-0.385-0.038l-1.902-0.49l-0.77-0.061l-0.386-0.021l-0.363-0.405l-0.791,0.341l-0.423,0.362l-0.385-0.021l-0.812,0.725l-1.193,0.303l-0.385-0.021l0.748,0.443l-0.021,0.385l-0.855,1.492l-0.444,0.746l-1.343,3.006l-0.449,1.13l-0.444,0.746l-0.834,1.108l-0.021,0.384l-0.423,0.362l-0.406,0.362l-0.021,0.384l-0.487,1.514l-0.428,0.746l-0.021,0.385l-0.021,0.4l6.183,6.555l0.363,0.404l1.476,1.254l1.453,1.639l1.091,1.215l1.073,1.232l2.224,1.68l-0.471,1.515l-0.444,0.745l-0.835,1.109l-1.111-0.832l-0.791,0.342l-1.236,1.086l-1.518-0.486l-2.63-1.317l-1.518-0.486l-2.262-1.296l-3.442-0.594l-0.77-0.043l-0.363-0.422l-1.92-0.491l-2.985,4.456l-0.812,0.725l-0.428,0.746l-1.744,2.984l-0.021,0.385l-0.021,0.383l-1.278,1.855l-1.278,1.854l-1.707,2.602l-0.449,1.13l-0.423,0.362l-0.021,0.384l-0.812,0.726l-0.406,0.361l-0.466,1.131l-1.476-1.254l-2.223-1.681l-1.643,1.449l-1.625,1.45l-2.412,1.406l-3.22,1.73l-3.159,0.963l-0.386-0.021l-1.111-0.848l-3.16,0.98l-1.475-1.254l-1.839-1.66l-2.904,3.305l-2.048,1.812l-2.069,2.179l-0.363-0.405l-1.535-0.47l-0.363-0.422l-0.385-0.021l-1.134-0.448l-0.688-1.211l-2.412,1.406l-0.829,0.725l-2.433,1.774l-3.459-0.594l-0.749-0.427l-1.518-0.486l-1.134-0.447l-3.865-0.248l-3.442-0.593l-1.983,0.66l-1.89-7.087l-0.153-3.876l0.021-0.384l0.509-1.897l2.348-0.238l0.77,0.042l0.771,0.043l0.406-0.361l2.433-1.774l0.444-0.746l1.75-3.386l1.787-3.752l-0.77-0.043l-1.497-0.869l-1.919-0.508l-3.036-0.955l2.112-2.964l-0.748-0.427l-0.363-0.405l-1.779-2.427l0.834-1.108l0.487-1.53l0.834-1.108l0.895-1.876l1.3-2.238l1.321-2.623l-1.111-0.832l-4.084-2.955l-0.71-0.826l-1.149-0.449l-1.134-0.465l-0.748-0.426l-3.058-0.572l-1.133-0.465l-0.77-0.043l-0.749-0.426l-1.149-0.465l-1.519-0.47l-1.219,1.07l-1.235,1.087l-1.663,1.834l-2.288-0.529l0.304,1.189l-0.471,1.514l-0.406,0.362l-1.278,1.854l-0.771-0.043l-1.192,0.303l-0.385-0.021l-1.235,1.088l-1.583,0.682l-2.287-0.529l-1.476-1.254l-1.192,0.32l-0.304-1.189l-0.363-0.406l-0.386-0.021l-0.786-0.043l-0.77-0.042l-0.406,0.346l-0.449,1.146l-0.401-0.038l-1.177,0.319l-0.385-0.021l-0.363-0.406l-0.363-0.404l-0.727-0.828l-0.728-0.811l-1.539-0.102l-0.406,0.362l-0.363-0.405l-2.288-0.529l-0.786-0.043l-1.177,0.32l-1.859-1.275l-0.385-0.021l-1.817-2.043l-1.902-0.508l-1.882-0.891l-0.385-0.021l-1.882-0.892l-1.534-0.486l-2.245-1.297l0.444-0.745l-0.363-0.406l-2.972-2.106l-1.86-1.275l-5.194-3.804l-2.245-1.297l-0.727-0.811l-2.224-1.68l-6.046-2.696l-0.812,0.725l-1.176,0.32l-1.236,1.087l-3.262,2.499l-1.626,1.449l-0.808,0.341l-1.219,1.087l-1.133-0.465l-2.921,3.305l0.363,0.405l-3.203,1.747l1.112,0.832l-1.279,1.855l-0.423,0.361l-1.604,1.066l-0.748-0.427l-4.969,5.099l-1.322,2.623l-0.851,1.108l-0.449,1.13l-0.444,0.746l-0.834,1.109l-0.851,1.107l-0.428,0.746l-0.873,1.51l-6.405,3.461l-1.193,0.32l-1.967,0.66l-0.406,0.346l-1.963,0.277l-2.33,0.238l-0.402-0.021 M552.595,178.255l-0.129-1.562l0.048,2.712l-0.454,0.74l-0.438,0.74l-0.411,0.356l-0.481,1.124l-0.107,1.534l-0.071,0.783l-0.134,1.917l-0.07,0.767l-0.053,0.767l-0.027,0.383l-0.438,0.74l-1.743,2.577l-0.07,0.783l-0.438,0.74l-0.508,1.507l-0.054,0.767l-0.85,1.097l-0.044,0.383l-0.385-0.027l-0.465,1.124l-0.053,0.767l-0.027,0.383l0.385,0.027l0.672,1.22l-0.438,0.74l-0.08,1.15l0.385,0.027l-0.84,0.713l4.55,1.505l-0.026,0.384l0.672,1.22l1.02,1.998l1.277-1.453l0.85-1.097l2.835,3.699l1.072,1.248l3.202,3.726l-2.922,2.863l-2.528,2.523l-2.923,2.88l-0.027,0.384l-1.635,1.042l-0.412,0.357l-3.27,2.069l-1.458-1.274l-0.742-0.437l-1.814-1.685l-4.069-2.629l-2.898-2.532l-0.07,0.767l-0.92,1.863l-0.438,0.74l-0.465,1.124l-0.026,0.384l-0.044,0.383l-0.134,1.934l-0.411,0.357l-0.044,0.383l-0.411,0.357l-0.027,0.383l-0.384-0.026l-3.174,0.919l-0.384-0.027l-0.027,0.383l-0.385-0.027l-0.026,0.384l-0.044,0.383l0.331,0.794l-0.026,0.383l-0.054,0.767l-0.026,0.383l-0.071,0.783l-0.411,0.357l-0.026,0.383l-0.411,0.357l-0.412,0.356l-2.072,1.767l-0.429,0.356l-0.411,0.357l-0.411,0.357l-0.411,0.356l-0.482,1.123l-0.026,0.384l-0.465,1.124l-0.742-0.437l-3.782-1.436l-2.592,3.674l-3.09,4.796l-2.538,2.907l-0.974,2.63l-1.716,2.193l-0.509,1.507l-0.411,0.356l-1.331,2.22l1.458,1.274l-0.438,0.74l0.672,1.203l-0.026,0.384l-0.438,0.757l-0.027,0.383l-0.411,0.357l-0.481,1.123l0.769,0.054l1.101,0.847l1.511,0.507l-1.901,9.922l-0.097,1.15l-0.054,0.767l0.331,0.793l-1.331,2.237l-1.565,0.26l-1.197,0.303l-2.814,1.329l-0.108,1.551l-0.07,0.767l-0.026,0.383l0.357,0.41l0.358,0.411l1.126,0.48l0.385,0.027l0.77,0.053l0.357,0.41l0.742,0.454l0.715,0.82l-0.026,0.383l0.716,0.821l0.357,0.427l-0.027,0.384l-0.026,0.383l-0.385-0.027l-0.026,0.383l-0.813,0.33l-0.384-0.027l-0.027,0.384l-0.384-0.043l-0.411,0.356l-0.411,0.357l-0.044,0.383l-0.385-0.026l-0.026,0.383l-0.385-0.027l-0.411,0.356l-0.027,0.384l-0.026,0.383l0.385,0.027l-0.027,0.4l0.357,0.41l0.288,1.177l-0.027,0.383l-0.411,0.357l-0.411,0.356l-0.027,0.384l-0.401-0.027l-0.438,0.74l-0.796,0.33l-0.411,0.357l-0.455,0.74l-0.026,0.383l-0.438,0.74l-0.411,0.357l-0.812,0.33l-0.411,0.356l0.688,1.204l0.742,0.454l-0.027,0.383l1.432,1.641l1.61,4.385l0.314,0.793l1.941,5.179l-0.85,1.097l2.129,2.478l-0.411,0.356l-4.631-0.338l-1.635,1.026l-0.411,0.356l-1.234,1.07l-0.839,0.713l-1.234,1.07l-0.428,0.356l-0.438,0.74l-0.796,0.33l-1.484-0.891l-0.742-0.438l-1.484-0.891l-0.716-0.82l-0.769-0.07l-0.509,1.523l-2.812,6.356l-1.131,2.787 M234.592,239.54l-0.058,0.77l-0.116,1.539l-1.216,0.683l-1.215,0.683l-1.602,0.653l-1.215,0.683l-1.631,1.039l-2.016,1.009l-0.83,0.712l-2.016,1.009l-0.415,0.356l-1.215,0.683l-0.415,0.355l-0.415,0.356l-0.415,0.356l-1.186,0.298l-1.216,0.683l-0.801,0.327l-0.414,0.356l0.327,0.798l0.357,0.414l0.299,1.184l0.356,0.414l0.356,0.414l0.743,0.443l0.356,0.414l-0.028,0.385l-0.087,1.154l0.327,0.798l-0.028,0.385l1.07,1.241l0.356,0.414l-0.028,0.385l-0.029,0.385l0.299,1.184l0.386,0.029l0.357,0.414l0.356,0.414l0.386,0.029l-0.058,0.77l-0.058,0.77l0.386,0.029l-0.029,0.385l0.357,0.414l0.327,0.798l0.328,0.799l0.356,0.414l0.357,0.414l0.356,0.414l-0.028,0.385l0.327,0.798l-0.473,1.125l0.271,1.568l-0.029,0.385l0.356,0.414l0.357,0.414l0.386,0.029l0.714,0.827l0.356,0.414l-0.059,0.77l0.387,0.029l0.299,1.183l-0.029,0.385l-0.028,0.385l0.713,0.828l0.357,0.414l-0.029,0.385l0.328,0.798l-0.029,0.385l-0.087,1.154l-0.028,0.385l-0.058,0.77l-0.059,0.77l-0.443,0.741l-0.415,0.355l-0.059,0.77l-0.028,0.385l-0.029,0.385l-0.029,0.385l-0.028,0.385l-0.029,0.385l-0.028,0.385l-0.415,0.356l-0.029,0.385l0.299,1.183l-0.058,0.77l0.829-0.711l1.187-0.298l0.801-0.327l0.801-0.327l0.415-0.356l0.8-0.327l0.386,0.029l0.743,0.443l1.456,1.27l0.386,0.029l1.1,0.856l0.743,0.443l0.473-1.125l2.306-4.857l-0.328-0.798l0.771,0.058l1.216-0.683l1.572-0.269l8.421-3.624l1.571-0.269l0.801-0.327l4.418-1.99l1.157,0.087l1.544,0.116l3.501-0.124l3.115-0.153l3.887-0.095l3.888-0.095l2.729-0.182l1.543,0.116l0.705-4.203l0.443-0.741l0.029-0.385l0.801-0.327l1.187-0.298l1.186-0.298l1.987-0.625l2.373-0.596l0.386,0.029l0.415-0.355l1.572-0.269l2.016-1.009l1.604-0.753l2.912,2.541\"/>\n		</svg>\n\n	</div>	\n</div>";
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
function _getDiptyqueShoes() {
    var hashObj = _Router2['default'].getNewHash();
    var baseurl = _getPageAssetsBasePathById(hashObj.parent, hashObj.target);
    var shoes = _getContentScope().shoes;
    var urls = [];
    for (var i = 0; i < shoes.length; i++) {
        var filename = shoes[i];
        var path = baseurl + 'shoes/' + filename;
        urls[i] = path;
    };
    return urls;
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
    diptyqueShoes: function diptyqueShoes() {
        return _getDiptyqueShoes();
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
		key: 'GetImgUrlId',
		value: function GetImgUrlId(url) {
			var split = url.split('/');
			return split[split.length - 1].split('.')[0];
		}
	}]);

	return Utils;
})();

exports['default'] = Utils;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/raf.js":[function(require,module,exports){
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
			// var wrapper = this.element

			// // transition In
			// this.tlIn.from(wrapper, 1, { opacity:0, ease:Expo.easeInOut })

			// // transition Out
			// this.tlOut.to(wrapper, 1, { opacity:0, ease:Expo.easeInOut })

			// reset
			this.tlIn.pause(0);
			this.tlOut.pause(0);
		}
	}, {
		key: 'willTransitionIn',
		value: function willTransitionIn() {
			var _this2 = this;

			this.tlIn.timeScale(1.4);
			setTimeout(function () {
				return _this2.tlIn.play(0);
			}, 800);
		}
	}, {
		key: 'willTransitionOut',
		value: function willTransitionOut() {
			var _this3 = this;

			if (this.tlOut.getChildren().length < 1) {
				this.didTransitionOutComplete();
			} else {
				this.tlOut.timeScale(1.2);
				setTimeout(function () {
					return _this3.tlOut.play(0);
				}, 500);
			}
		}
	}, {
		key: 'didTransitionInComplete',
		value: function didTransitionInComplete() {
			var _this4 = this;

			setTimeout(function () {
				return _this4.props.didTransitionInComplete();
			}, 0);
		}
	}, {
		key: 'didTransitionOutComplete',
		value: function didTransitionOutComplete() {
			var _this5 = this;

			setTimeout(function () {
				return _this5.props.didTransitionOutComplete();
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
			if (newComponent != undefined) newComponent.parent.css('z-index', 2);
			if (oldComponent != undefined) oldComponent.parent.css('z-index', 1);
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
				"map_txt": "MAP"
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
				"background.jpg"
			]
		},

        "deia/mateo": {
        	"shoes": [
        		"s_0.png",
        		"s_1.png",
        		"s_2.png"
        	]
        },
        "deia/dub": {
        },
        "deia/marta": {
        },

        "es-trenc/beluga": {
        },
        "es-trenc/isamu": {
        },

		"arelluf/capas": {
		},
        "arelluf/pelotas": {
        },
        "arelluf/marta": {
        },
        "arelluf/kobarah": {
        },
		"arelluf/dub": {
        },
        "arelluf/paradise": {
        }

	}
}
},{}]},{},["/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/Main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9NYWluLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9BcHAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcE1vYmlsZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvQXBwVGVtcGxhdGUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcFRlbXBsYXRlTW9iaWxlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9hY3Rpb25zL0FwcEFjdGlvbnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvRnJvbnRDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUFhDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9QYWdlc0NvbnRhaW5lci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9hcm91bmQtYm9yZGVyLWhvbWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvYm90dG9tLXRleHRzLWhvbWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvY2hhcmFjdGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2RpcHR5cXVlLXBhcnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvZ3JpZC1ob21lLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2dyaWQtcG9zaXRpb25zLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2hlYWRlci1saW5rcy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9tYWluLXNob2UuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWFwLWhvbWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvcGFnZXMvRGlwdHlxdWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvcGFnZXMvSG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9zaG9lcy1ncmlkLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3Nob2VzLWhvbGRlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9zb2NpYWwtbGlua3MuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvdmlkZW8tY2FudmFzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb25zdGFudHMvQXBwQ29uc3RhbnRzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9kaXNwYXRjaGVycy9BcHBEaXNwYXRjaGVyLmpzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9EaXB0eXF1ZS5oYnMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL0Zyb250Q29udGFpbmVyLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvSG9tZS5oYnMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL1BhZ2VzQ29udGFpbmVyLmhicyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc2VydmljZXMvR2xvYmFsRXZlbnRzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zZXJ2aWNlcy9QcmVsb2FkZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3NlcnZpY2VzL1JvdXRlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc3RvcmVzL0FwcFN0b3JlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC91dGlscy9QeEhlbHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvdXRpbHMvVXRpbHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3V0aWxzL3JhZi5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9QYWdlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VDb21wb25lbnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvcGFnZXIvY29tcG9uZW50cy9CYXNlUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VQYWdlci5qcyIsInd3dy9kYXRhL2RhdGEuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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TyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7O0FBRXpELFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNDLFFBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN0QixNQUFFLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsR0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxBQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUNuRSxNQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7SUFDeEIsQ0FBQztBQUNGLFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzlDLFFBQUksRUFBRSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN6QixNQUFFLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsSUFBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLEFBQUMsR0FBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxBQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUN6RixNQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQTtJQUNsQyxDQUFDO0FBQ0YsUUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUMsUUFBSSxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvYmFzZScpO1xuXG52YXIgYmFzZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG4vLyBFYWNoIG9mIHRoZXNlIGF1Z21lbnQgdGhlIEhhbmRsZWJhcnMgb2JqZWN0LiBObyBuZWVkIHRvIHNldHVwIGhlcmUuXG4vLyAoVGhpcyBpcyBkb25lIHRvIGVhc2lseSBzaGFyZSBjb2RlIGJldHdlZW4gY29tbW9uanMgYW5kIGJyb3dzZSBlbnZzKVxuXG52YXIgX1NhZmVTdHJpbmcgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcnKTtcblxudmFyIF9TYWZlU3RyaW5nMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9TYWZlU3RyaW5nKTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgX2ltcG9ydDIgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydDIpO1xuXG52YXIgX2ltcG9ydDMgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvcnVudGltZScpO1xuXG52YXIgcnVudGltZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQzKTtcblxudmFyIF9ub0NvbmZsaWN0ID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL25vLWNvbmZsaWN0Jyk7XG5cbnZhciBfbm9Db25mbGljdDIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbm9Db25mbGljdCk7XG5cbi8vIEZvciBjb21wYXRpYmlsaXR5IGFuZCB1c2FnZSBvdXRzaWRlIG9mIG1vZHVsZSBzeXN0ZW1zLCBtYWtlIHRoZSBIYW5kbGViYXJzIG9iamVjdCBhIG5hbWVzcGFjZVxuZnVuY3Rpb24gY3JlYXRlKCkge1xuICB2YXIgaGIgPSBuZXcgYmFzZS5IYW5kbGViYXJzRW52aXJvbm1lbnQoKTtcblxuICBVdGlscy5leHRlbmQoaGIsIGJhc2UpO1xuICBoYi5TYWZlU3RyaW5nID0gX1NhZmVTdHJpbmcyWydkZWZhdWx0J107XG4gIGhiLkV4Y2VwdGlvbiA9IF9FeGNlcHRpb24yWydkZWZhdWx0J107XG4gIGhiLlV0aWxzID0gVXRpbHM7XG4gIGhiLmVzY2FwZUV4cHJlc3Npb24gPSBVdGlscy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIGhiLlZNID0gcnVudGltZTtcbiAgaGIudGVtcGxhdGUgPSBmdW5jdGlvbiAoc3BlYykge1xuICAgIHJldHVybiBydW50aW1lLnRlbXBsYXRlKHNwZWMsIGhiKTtcbiAgfTtcblxuICByZXR1cm4gaGI7XG59XG5cbnZhciBpbnN0ID0gY3JlYXRlKCk7XG5pbnN0LmNyZWF0ZSA9IGNyZWF0ZTtcblxuX25vQ29uZmxpY3QyWydkZWZhdWx0J10oaW5zdCk7XG5cbmluc3RbJ2RlZmF1bHQnXSA9IGluc3Q7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGluc3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuSGFuZGxlYmFyc0Vudmlyb25tZW50ID0gSGFuZGxlYmFyc0Vudmlyb25tZW50O1xuZXhwb3J0cy5jcmVhdGVGcmFtZSA9IGNyZWF0ZUZyYW1lO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbnZhciBfRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBWRVJTSU9OID0gJzMuMC4xJztcbmV4cG9ydHMuVkVSU0lPTiA9IFZFUlNJT047XG52YXIgQ09NUElMRVJfUkVWSVNJT04gPSA2O1xuXG5leHBvcnRzLkNPTVBJTEVSX1JFVklTSU9OID0gQ09NUElMRVJfUkVWSVNJT047XG52YXIgUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc9PSAxLngueCcsXG4gIDU6ICc9PSAyLjAuMC1hbHBoYS54JyxcbiAgNjogJz49IDIuMC4wLWJldGEuMSdcbn07XG5cbmV4cG9ydHMuUkVWSVNJT05fQ0hBTkdFUyA9IFJFVklTSU9OX0NIQU5HRVM7XG52YXIgaXNBcnJheSA9IFV0aWxzLmlzQXJyYXksXG4gICAgaXNGdW5jdGlvbiA9IFV0aWxzLmlzRnVuY3Rpb24sXG4gICAgdG9TdHJpbmcgPSBVdGlscy50b1N0cmluZyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbmZ1bmN0aW9uIEhhbmRsZWJhcnNFbnZpcm9ubWVudChoZWxwZXJzLCBwYXJ0aWFscykge1xuICB0aGlzLmhlbHBlcnMgPSBoZWxwZXJzIHx8IHt9O1xuICB0aGlzLnBhcnRpYWxzID0gcGFydGlhbHMgfHwge307XG5cbiAgcmVnaXN0ZXJEZWZhdWx0SGVscGVycyh0aGlzKTtcbn1cblxuSGFuZGxlYmFyc0Vudmlyb25tZW50LnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IEhhbmRsZWJhcnNFbnZpcm9ubWVudCxcblxuICBsb2dnZXI6IGxvZ2dlcixcbiAgbG9nOiBsb2csXG5cbiAgcmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uIHJlZ2lzdGVySGVscGVyKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7XG4gICAgICB9XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbiB1bnJlZ2lzdGVySGVscGVyKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5oZWxwZXJzW25hbWVdO1xuICB9LFxuXG4gIHJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24gcmVnaXN0ZXJQYXJ0aWFsKG5hbWUsIHBhcnRpYWwpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHBhcnRpYWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdBdHRlbXB0aW5nIHRvIHJlZ2lzdGVyIGEgcGFydGlhbCBhcyB1bmRlZmluZWQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBwYXJ0aWFsO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uIHVucmVnaXN0ZXJQYXJ0aWFsKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5wYXJ0aWFsc1tuYW1lXTtcbiAgfVxufTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0SGVscGVycyhpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8gQSBtaXNzaW5nIGZpZWxkIGluIGEge3tmb299fSBjb25zdHVjdC5cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNvbWVvbmUgaXMgYWN0dWFsbHkgdHJ5aW5nIHRvIGNhbGwgc29tZXRoaW5nLCBibG93IHVwLlxuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ01pc3NpbmcgaGVscGVyOiBcIicgKyBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdLm5hbWUgKyAnXCInKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgICBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGZuKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoY29udGV4dCA9PT0gZmFsc2UgfHwgY29udGV4dCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgIGlmIChjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgICAgICAgb3B0aW9ucy5pZHMgPSBbb3B0aW9ucy5uYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMubmFtZSk7XG4gICAgICAgIG9wdGlvbnMgPSB7IGRhdGE6IGRhdGEgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ011c3QgcGFzcyBpdGVyYXRvciB0byAjZWFjaCcpO1xuICAgIH1cblxuICAgIHZhciBmbiA9IG9wdGlvbnMuZm4sXG4gICAgICAgIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICByZXQgPSAnJyxcbiAgICAgICAgZGF0YSA9IHVuZGVmaW5lZCxcbiAgICAgICAgY29udGV4dFBhdGggPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICBjb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pICsgJy4nO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7XG4gICAgICBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWNJdGVyYXRpb24oZmllbGQsIGluZGV4LCBsYXN0KSB7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBkYXRhLmtleSA9IGZpZWxkO1xuICAgICAgICBkYXRhLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIGRhdGEuZmlyc3QgPSBpbmRleCA9PT0gMDtcbiAgICAgICAgZGF0YS5sYXN0ID0gISFsYXN0O1xuXG4gICAgICAgIGlmIChjb250ZXh0UGF0aCkge1xuICAgICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBjb250ZXh0UGF0aCArIGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbZmllbGRdLCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBVdGlscy5ibG9ja1BhcmFtcyhbY29udGV4dFtmaWVsZF0sIGZpZWxkXSwgW2NvbnRleHRQYXRoICsgZmllbGQsIG51bGxdKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IgKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKGksIGksIGkgPT09IGNvbnRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwcmlvcktleSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIHJ1bm5pbmcgdGhlIGl0ZXJhdGlvbnMgb25lIHN0ZXAgb3V0IG9mIHN5bmMgc28gd2UgY2FuIGRldGVjdFxuICAgICAgICAgICAgLy8gdGhlIGxhc3QgaXRlcmF0aW9uIHdpdGhvdXQgaGF2ZSB0byBzY2FuIHRoZSBvYmplY3QgdHdpY2UgYW5kIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYW4gaXRlcm1lZGlhdGUga2V5cyBhcnJheS5cbiAgICAgICAgICAgIGlmIChwcmlvcktleSkge1xuICAgICAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmlvcktleSA9IGtleTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByaW9yS2V5KSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24gKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uYWwpKSB7XG4gICAgICBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpcyB0byByZW5kZXIgdGhlIHBvc2l0aXZlIHBhdGggaWYgdGhlIHZhbHVlIGlzIHRydXRoeSBhbmQgbm90IGVtcHR5LlxuICAgIC8vIFRoZSBgaW5jbHVkZVplcm9gIG9wdGlvbiBtYXkgYmUgc2V0IHRvIHRyZWF0IHRoZSBjb25kdGlvbmFsIGFzIHB1cmVseSBub3QgZW1wdHkgYmFzZWQgb24gdGhlXG4gICAgLy8gYmVoYXZpb3Igb2YgaXNFbXB0eS4gRWZmZWN0aXZlbHkgdGhpcyBkZXRlcm1pbmVzIGlmIDAgaXMgaGFuZGxlZCBieSB0aGUgcG9zaXRpdmUgcGF0aCBvciBuZWdhdGl2ZS5cbiAgICBpZiAoIW9wdGlvbnMuaGFzaC5pbmNsdWRlWmVybyAmJiAhY29uZGl0aW9uYWwgfHwgVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uIChjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHsgZm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbiwgaGFzaDogb3B0aW9ucy5oYXNoIH0pO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmICghVXRpbHMuaXNFbXB0eShjb250ZXh0KSkge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKTtcbiAgICAgICAgb3B0aW9ucyA9IHsgZGF0YTogZGF0YSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgICB2YXIgbGV2ZWwgPSBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwgPyBwYXJzZUludChvcHRpb25zLmRhdGEubGV2ZWwsIDEwKSA6IDE7XG4gICAgaW5zdGFuY2UubG9nKGxldmVsLCBtZXNzYWdlKTtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvb2t1cCcsIGZ1bmN0aW9uIChvYmosIGZpZWxkKSB7XG4gICAgcmV0dXJuIG9iaiAmJiBvYmpbZmllbGRdO1xuICB9KTtcbn1cblxudmFyIGxvZ2dlciA9IHtcbiAgbWV0aG9kTWFwOiB7IDA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InIH0sXG5cbiAgLy8gU3RhdGUgZW51bVxuICBERUJVRzogMCxcbiAgSU5GTzogMSxcbiAgV0FSTjogMixcbiAgRVJST1I6IDMsXG4gIGxldmVsOiAxLFxuXG4gIC8vIENhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24gbG9nKGxldmVsLCBtZXNzYWdlKSB7XG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBsb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIChjb25zb2xlW21ldGhvZF0gfHwgY29uc29sZS5sb2cpLmNhbGwoY29uc29sZSwgbWVzc2FnZSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG52YXIgbG9nID0gbG9nZ2VyLmxvZztcblxuZXhwb3J0cy5sb2cgPSBsb2c7XG5cbmZ1bmN0aW9uIGNyZWF0ZUZyYW1lKG9iamVjdCkge1xuICB2YXIgZnJhbWUgPSBVdGlscy5leHRlbmQoe30sIG9iamVjdCk7XG4gIGZyYW1lLl9wYXJlbnQgPSBvYmplY3Q7XG4gIHJldHVybiBmcmFtZTtcbn1cblxuLyogW2FyZ3MsIF1vcHRpb25zICovIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIHZhciBsb2MgPSBub2RlICYmIG5vZGUubG9jLFxuICAgICAgbGluZSA9IHVuZGVmaW5lZCxcbiAgICAgIGNvbHVtbiA9IHVuZGVmaW5lZDtcbiAgaWYgKGxvYykge1xuICAgIGxpbmUgPSBsb2Muc3RhcnQubGluZTtcbiAgICBjb2x1bW4gPSBsb2Muc3RhcnQuY29sdW1uO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBjb2x1bW47XG4gIH1cblxuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG5cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgRXhjZXB0aW9uKTtcbiAgfVxuXG4gIGlmIChsb2MpIHtcbiAgICB0aGlzLmxpbmVOdW1iZXIgPSBsaW5lO1xuICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICB9XG59XG5cbkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gRXhjZXB0aW9uO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLypnbG9iYWwgd2luZG93ICovXG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uIChIYW5kbGViYXJzKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHZhciByb290ID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3csXG4gICAgICAkSGFuZGxlYmFycyA9IHJvb3QuSGFuZGxlYmFycztcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgSGFuZGxlYmFycy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChyb290LkhhbmRsZWJhcnMgPT09IEhhbmRsZWJhcnMpIHtcbiAgICAgIHJvb3QuSGFuZGxlYmFycyA9ICRIYW5kbGViYXJzO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5jaGVja1JldmlzaW9uID0gY2hlY2tSZXZpc2lvbjtcblxuLy8gVE9ETzogUmVtb3ZlIHRoaXMgbGluZSBhbmQgYnJlYWsgdXAgY29tcGlsZVBhcnRpYWxcblxuZXhwb3J0cy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuZXhwb3J0cy53cmFwUHJvZ3JhbSA9IHdyYXBQcm9ncmFtO1xuZXhwb3J0cy5yZXNvbHZlUGFydGlhbCA9IHJlc29sdmVQYXJ0aWFsO1xuZXhwb3J0cy5pbnZva2VQYXJ0aWFsID0gaW52b2tlUGFydGlhbDtcbmV4cG9ydHMubm9vcCA9IG5vb3A7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lID0gcmVxdWlyZSgnLi9iYXNlJyk7XG5cbmZ1bmN0aW9uIGNoZWNrUmV2aXNpb24oY29tcGlsZXJJbmZvKSB7XG4gIHZhciBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvICYmIGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgY3VycmVudFJldmlzaW9uID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5SRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgKyAnUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIHJ1bnRpbWVWZXJzaW9ucyArICcpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVyVmVyc2lvbnMgKyAnKS4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICsgJ1BsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVySW5mb1sxXSArICcpLicpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0ZW1wbGF0ZSh0ZW1wbGF0ZVNwZWMsIGVudikge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAoIWVudikge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGUnKTtcbiAgfVxuICBpZiAoIXRlbXBsYXRlU3BlYyB8fCAhdGVtcGxhdGVTcGVjLm1haW4pIHtcbiAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVW5rbm93biB0ZW1wbGF0ZSBvYmplY3Q6ICcgKyB0eXBlb2YgdGVtcGxhdGVTcGVjKTtcbiAgfVxuXG4gIC8vIE5vdGU6IFVzaW5nIGVudi5WTSByZWZlcmVuY2VzIHJhdGhlciB0aGFuIGxvY2FsIHZhciByZWZlcmVuY2VzIHRocm91Z2hvdXQgdGhpcyBzZWN0aW9uIHRvIGFsbG93XG4gIC8vIGZvciBleHRlcm5hbCB1c2VycyB0byBvdmVycmlkZSB0aGVzZSBhcyBwc3VlZG8tc3VwcG9ydGVkIEFQSXMuXG4gIGVudi5WTS5jaGVja1JldmlzaW9uKHRlbXBsYXRlU3BlYy5jb21waWxlcik7XG5cbiAgZnVuY3Rpb24gaW52b2tlUGFydGlhbFdyYXBwZXIocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmhhc2gpIHtcbiAgICAgIGNvbnRleHQgPSBVdGlscy5leHRlbmQoe30sIGNvbnRleHQsIG9wdGlvbnMuaGFzaCk7XG4gICAgfVxuXG4gICAgcGFydGlhbCA9IGVudi5WTS5yZXNvbHZlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIHZhciByZXN1bHQgPSBlbnYuVk0uaW52b2tlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuXG4gICAgaWYgKHJlc3VsdCA9PSBudWxsICYmIGVudi5jb21waWxlKSB7XG4gICAgICBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0gPSBlbnYuY29tcGlsZShwYXJ0aWFsLCB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJPcHRpb25zLCBlbnYpO1xuICAgICAgcmVzdWx0ID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgIGlmIChvcHRpb25zLmluZGVudCkge1xuICAgICAgICB2YXIgbGluZXMgPSByZXN1bHQuc3BsaXQoJ1xcbicpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpbmVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICghbGluZXNbaV0gJiYgaSArIDEgPT09IGwpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpbmVzW2ldID0gb3B0aW9ucy5pbmRlbnQgKyBsaW5lc1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgY29tcGlsZWQgd2hlbiBydW5uaW5nIGluIHJ1bnRpbWUtb25seSBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICBzdHJpY3Q6IGZ1bmN0aW9uIHN0cmljdChvYmosIG5hbWUpIHtcbiAgICAgIGlmICghKG5hbWUgaW4gb2JqKSkge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnXCInICsgbmFtZSArICdcIiBub3QgZGVmaW5lZCBpbiAnICsgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbbmFtZV07XG4gICAgfSxcbiAgICBsb29rdXA6IGZ1bmN0aW9uIGxvb2t1cChkZXB0aHMsIG5hbWUpIHtcbiAgICAgIHZhciBsZW4gPSBkZXB0aHMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZGVwdGhzW2ldICYmIGRlcHRoc1tpXVtuYW1lXSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGRlcHRoc1tpXVtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbGFtYmRhOiBmdW5jdGlvbiBsYW1iZGEoY3VycmVudCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBjdXJyZW50ID09PSAnZnVuY3Rpb24nID8gY3VycmVudC5jYWxsKGNvbnRleHQpIDogY3VycmVudDtcbiAgICB9LFxuXG4gICAgZXNjYXBlRXhwcmVzc2lvbjogVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICBpbnZva2VQYXJ0aWFsOiBpbnZva2VQYXJ0aWFsV3JhcHBlcixcblxuICAgIGZuOiBmdW5jdGlvbiBmbihpKSB7XG4gICAgICByZXR1cm4gdGVtcGxhdGVTcGVjW2ldO1xuICAgIH0sXG5cbiAgICBwcm9ncmFtczogW10sXG4gICAgcHJvZ3JhbTogZnVuY3Rpb24gcHJvZ3JhbShpLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgICB2YXIgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldLFxuICAgICAgICAgIGZuID0gdGhpcy5mbihpKTtcbiAgICAgIGlmIChkYXRhIHx8IGRlcHRocyB8fCBibG9ja1BhcmFtcyB8fCBkZWNsYXJlZEJsb2NrUGFyYW1zKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgIH0sXG5cbiAgICBkYXRhOiBmdW5jdGlvbiBkYXRhKHZhbHVlLCBkZXB0aCkge1xuICAgICAgd2hpbGUgKHZhbHVlICYmIGRlcHRoLS0pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5fcGFyZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgbWVyZ2U6IGZ1bmN0aW9uIG1lcmdlKHBhcmFtLCBjb21tb24pIHtcbiAgICAgIHZhciBvYmogPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgIGlmIChwYXJhbSAmJiBjb21tb24gJiYgcGFyYW0gIT09IGNvbW1vbikge1xuICAgICAgICBvYmogPSBVdGlscy5leHRlbmQoe30sIGNvbW1vbiwgcGFyYW0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cbiAgICBub29wOiBlbnYuVk0ubm9vcCxcbiAgICBjb21waWxlckluZm86IHRlbXBsYXRlU3BlYy5jb21waWxlclxuICB9O1xuXG4gIGZ1bmN0aW9uIHJldChjb250ZXh0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIGRhdGEgPSBvcHRpb25zLmRhdGE7XG5cbiAgICByZXQuX3NldHVwKG9wdGlvbnMpO1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsICYmIHRlbXBsYXRlU3BlYy51c2VEYXRhKSB7XG4gICAgICBkYXRhID0gaW5pdERhdGEoY29udGV4dCwgZGF0YSk7XG4gICAgfVxuICAgIHZhciBkZXB0aHMgPSB1bmRlZmluZWQsXG4gICAgICAgIGJsb2NrUGFyYW1zID0gdGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zID8gW10gOiB1bmRlZmluZWQ7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMpIHtcbiAgICAgIGRlcHRocyA9IG9wdGlvbnMuZGVwdGhzID8gW2NvbnRleHRdLmNvbmNhdChvcHRpb25zLmRlcHRocykgOiBbY29udGV4dF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRlbXBsYXRlU3BlYy5tYWluLmNhbGwoY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgfVxuICByZXQuaXNUb3AgPSB0cnVlO1xuXG4gIHJldC5fc2V0dXAgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLmhlbHBlcnMsIGVudi5oZWxwZXJzKTtcblxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsKSB7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLnBhcnRpYWxzLCBlbnYucGFydGlhbHMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgfVxuICB9O1xuXG4gIHJldC5fY2hpbGQgPSBmdW5jdGlvbiAoaSwgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgJiYgIWJsb2NrUGFyYW1zKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIGJsb2NrIHBhcmFtcycpO1xuICAgIH1cbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocyAmJiAhZGVwdGhzKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIHBhcmVudCBkZXB0aHMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCB0ZW1wbGF0ZVNwZWNbaV0sIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gIGZ1bmN0aW9uIHByb2coY29udGV4dCkge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHJldHVybiBmbi5jYWxsKGNvbnRhaW5lciwgY29udGV4dCwgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscywgb3B0aW9ucy5kYXRhIHx8IGRhdGEsIGJsb2NrUGFyYW1zICYmIFtvcHRpb25zLmJsb2NrUGFyYW1zXS5jb25jYXQoYmxvY2tQYXJhbXMpLCBkZXB0aHMgJiYgW2NvbnRleHRdLmNvbmNhdChkZXB0aHMpKTtcbiAgfVxuICBwcm9nLnByb2dyYW0gPSBpO1xuICBwcm9nLmRlcHRoID0gZGVwdGhzID8gZGVwdGhzLmxlbmd0aCA6IDA7XG4gIHByb2cuYmxvY2tQYXJhbXMgPSBkZWNsYXJlZEJsb2NrUGFyYW1zIHx8IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIGlmICghcGFydGlhbCkge1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV07XG4gIH0gZWxzZSBpZiAoIXBhcnRpYWwuY2FsbCAmJiAhb3B0aW9ucy5uYW1lKSB7XG4gICAgLy8gVGhpcyBpcyBhIGR5bmFtaWMgcGFydGlhbCB0aGF0IHJldHVybmVkIGEgc3RyaW5nXG4gICAgb3B0aW9ucy5uYW1lID0gcGFydGlhbDtcbiAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1twYXJ0aWFsXTtcbiAgfVxuICByZXR1cm4gcGFydGlhbDtcbn1cblxuZnVuY3Rpb24gaW52b2tlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMucGFydGlhbCA9IHRydWU7XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgZm91bmQnKTtcbiAgfSBlbHNlIGlmIChwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub29wKCkge1xuICByZXR1cm4gJyc7XG59XG5cbmZ1bmN0aW9uIGluaXREYXRhKGNvbnRleHQsIGRhdGEpIHtcbiAgaWYgKCFkYXRhIHx8ICEoJ3Jvb3QnIGluIGRhdGEpKSB7XG4gICAgZGF0YSA9IGRhdGEgPyBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5jcmVhdGVGcmFtZShkYXRhKSA6IHt9O1xuICAgIGRhdGEucm9vdCA9IGNvbnRleHQ7XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbmZ1bmN0aW9uIFNhZmVTdHJpbmcoc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufVxuXG5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IFNhZmVTdHJpbmcucHJvdG90eXBlLnRvSFRNTCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICcnICsgdGhpcy5zdHJpbmc7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTYWZlU3RyaW5nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7XG5cbi8vIE9sZGVyIElFIHZlcnNpb25zIGRvIG5vdCBkaXJlY3RseSBzdXBwb3J0IGluZGV4T2Ygc28gd2UgbXVzdCBpbXBsZW1lbnQgb3VyIG93biwgc2FkbHkuXG5leHBvcnRzLmluZGV4T2YgPSBpbmRleE9mO1xuZXhwb3J0cy5lc2NhcGVFeHByZXNzaW9uID0gZXNjYXBlRXhwcmVzc2lvbjtcbmV4cG9ydHMuaXNFbXB0eSA9IGlzRW1wdHk7XG5leHBvcnRzLmJsb2NrUGFyYW1zID0gYmxvY2tQYXJhbXM7XG5leHBvcnRzLmFwcGVuZENvbnRleHRQYXRoID0gYXBwZW5kQ29udGV4dFBhdGg7XG52YXIgZXNjYXBlID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gICdcXCcnOiAnJiN4Mjc7JyxcbiAgJ2AnOiAnJiN4NjA7J1xufTtcblxudmFyIGJhZENoYXJzID0gL1smPD5cIidgXS9nLFxuICAgIHBvc3NpYmxlID0gL1smPD5cIidgXS87XG5cbmZ1bmN0aW9uIGVzY2FwZUNoYXIoY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXTtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKG9iaiAvKiAsIC4uLnNvdXJjZSAqLykge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGtleSBpbiBhcmd1bWVudHNbaV0pIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXJndW1lbnRzW2ldLCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxuLyplc2xpbnQtZGlzYWJsZSBmdW5jLXN0eWxlLCBuby12YXIgKi9cbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gIH07XG59XG52YXIgaXNGdW5jdGlvbjtcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG4vKmVzbGludC1lbmFibGUgZnVuYy1zdHlsZSwgbm8tdmFyICovXG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07ZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlRXhwcmVzc2lvbihzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgJiYgc3RyaW5nLnRvSFRNTCkge1xuICAgICAgcmV0dXJuIHN0cmluZy50b0hUTUwoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgJyc7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmc7XG4gIH1cblxuICBpZiAoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbn1cblxuZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJsb2NrUGFyYW1zKHBhcmFtcywgaWRzKSB7XG4gIHBhcmFtcy5wYXRoID0gaWRzO1xuICByZXR1cm4gcGFyYW1zO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDb250ZXh0UGF0aChjb250ZXh0UGF0aCwgaWQpIHtcbiAgcmV0dXJuIChjb250ZXh0UGF0aCA/IGNvbnRleHRQYXRoICsgJy4nIDogJycpICsgaWQ7XG59IiwiLy8gQ3JlYXRlIGEgc2ltcGxlIHBhdGggYWxpYXMgdG8gYWxsb3cgYnJvd3NlcmlmeSB0byByZXNvbHZlXG4vLyB0aGUgcnVudGltZSBvbiBhIHN1cHBvcnRlZCBwYXRoLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZScpWydkZWZhdWx0J107XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJoYW5kbGViYXJzL3J1bnRpbWVcIilbXCJkZWZhdWx0XCJdO1xuIiwiLy8gQXZvaWQgY29uc29sZSBlcnJvcnMgZm9yIHRoZSBJRSBjcmFwcHkgYnJvd3NlcnNcbmlmICggISB3aW5kb3cuY29uc29sZSApIGNvbnNvbGUgPSB7IGxvZzogZnVuY3Rpb24oKXt9IH07XG5cbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBBcHAgZnJvbSAnQXBwJ1xuaW1wb3J0IEFwcE1vYmlsZSBmcm9tICdBcHBNb2JpbGUnXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgVHdlZW5NYXggZnJvbSAnZ3NhcCdcbmltcG9ydCByYWYgZnJvbSAncmFmJ1xuaW1wb3J0IE1vYmlsZURldGVjdCBmcm9tICdtb2JpbGUtZGV0ZWN0J1xud2luZG93LmpRdWVyeSA9IHdpbmRvdy4kID0gJFxuXG52YXIgbWQgPSBuZXcgTW9iaWxlRGV0ZWN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuXG5BcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IChtZC5tb2JpbGUoKSB8fCBtZC50YWJsZXQoKSkgPyB0cnVlIDogZmFsc2VcbkFwcFN0b3JlLlBhcmVudCA9ICQoJyNhcHAtY29udGFpbmVyJylcbkFwcFN0b3JlLkRldGVjdG9yLm9sZElFID0gQXBwU3RvcmUuUGFyZW50LmlzKCcuaWU2LCAuaWU3LCAuaWU4JylcbkFwcFN0b3JlLkRldGVjdG9yLmlzU3VwcG9ydFdlYkdMID0gVXRpbHMuU3VwcG9ydFdlYkdMKClcbmlmKEFwcFN0b3JlLkRldGVjdG9yLm9sZElFKSBBcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IHRydWVcblxuLy8gRGVidWdcbi8vIEFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlID0gdHJ1ZVxuXG52YXIgYXBwO1xuaWYoQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUpIHtcblx0JCgnaHRtbCcpLmFkZENsYXNzKCdtb2JpbGUnKVxuXHRhcHAgPSBuZXcgQXBwTW9iaWxlKClcbn1lbHNle1xuXHRhcHAgPSBuZXcgQXBwKClcdFxufSBcblxuYXBwLmluaXQoKVxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IEFwcFRlbXBsYXRlIGZyb20gJ0FwcFRlbXBsYXRlJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgR0V2ZW50cyBmcm9tICdHbG9iYWxFdmVudHMnXG5pbXBvcnQgUHJlbG9hZGVyIGZyb20gJ1ByZWxvYWRlcidcblxuY2xhc3MgQXBwIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5vbkFwcFJlYWR5ID0gdGhpcy5vbkFwcFJlYWR5LmJpbmQodGhpcylcblx0fVxuXHRpbml0KCkge1xuXHRcdC8vIEluaXQgcm91dGVyXG5cdFx0dGhpcy5yb3V0ZXIgPSBuZXcgUm91dGVyKClcblx0XHR0aGlzLnJvdXRlci5pbml0KClcblxuXHRcdC8vIEluaXQgUHJlbG9hZGVyXG5cdFx0QXBwU3RvcmUuUHJlbG9hZGVyID0gbmV3IFByZWxvYWRlcigpXG5cblx0XHQvLyBJbml0IGdsb2JhbCBldmVudHNcblx0XHR3aW5kb3cuR2xvYmFsRXZlbnRzID0gbmV3IEdFdmVudHMoKVxuXHRcdEdsb2JhbEV2ZW50cy5pbml0KClcblxuXHRcdHZhciBhcHBUZW1wbGF0ZSA9IG5ldyBBcHBUZW1wbGF0ZSgpXG5cdFx0YXBwVGVtcGxhdGUuaXNSZWFkeSA9IHRoaXMub25BcHBSZWFkeVxuXHRcdGFwcFRlbXBsYXRlLnJlbmRlcignI2FwcC1jb250YWluZXInKVxuXHR9XG5cdG9uQXBwUmVhZHkoKSB7XG5cdFx0Ly8gU3RhcnQgcm91dGluZ1xuXHRcdHRoaXMucm91dGVyLmJlZ2luUm91dGluZygpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwXG4gICAgXHRcbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgQXBwVGVtcGxhdGVNb2JpbGUgZnJvbSAnQXBwVGVtcGxhdGVNb2JpbGUnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBHRXZlbnRzIGZyb20gJ0dsb2JhbEV2ZW50cydcblxuY2xhc3MgQXBwTW9iaWxlIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0aW5pdCgpIHtcblx0XHQvLyBJbml0IHJvdXRlclxuXHRcdHZhciByb3V0ZXIgPSBuZXcgUm91dGVyKClcblx0XHRyb3V0ZXIuaW5pdCgpXG5cblx0XHQvLyBJbml0IGdsb2JhbCBldmVudHNcblx0XHR3aW5kb3cuR2xvYmFsRXZlbnRzID0gbmV3IEdFdmVudHMoKVxuXHRcdEdsb2JhbEV2ZW50cy5pbml0KClcblxuXHRcdHZhciBhcHBUZW1wbGF0ZU1vYmlsZSA9IG5ldyBBcHBUZW1wbGF0ZU1vYmlsZSgpXG5cdFx0YXBwVGVtcGxhdGVNb2JpbGUucmVuZGVyKCcjYXBwLWNvbnRhaW5lcicpXG5cblx0XHQvLyBTdGFydCByb3V0aW5nXG5cdFx0cm91dGVyLmJlZ2luUm91dGluZygpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwTW9iaWxlXG4gICAgXHRcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgRnJvbnRDb250YWluZXIgZnJvbSAnRnJvbnRDb250YWluZXInXG5pbXBvcnQgUGFnZXNDb250YWluZXIgZnJvbSAnUGFnZXNDb250YWluZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUFhDb250YWluZXIgZnJvbSAnUFhDb250YWluZXInXG5cbmNsYXNzIEFwcFRlbXBsYXRlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0XHR0aGlzLmFuaW1hdGUgPSB0aGlzLmFuaW1hdGUuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHRzdXBlci5yZW5kZXIoJ0FwcFRlbXBsYXRlJywgcGFyZW50LCB1bmRlZmluZWQpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5mcm9udENvbnRhaW5lciA9IG5ldyBGcm9udENvbnRhaW5lcigpXG5cdFx0dGhpcy5mcm9udENvbnRhaW5lci5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0dGhpcy5wYWdlc0NvbnRhaW5lciA9IG5ldyBQYWdlc0NvbnRhaW5lcigpXG5cdFx0dGhpcy5wYWdlc0NvbnRhaW5lci5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0dGhpcy5weENvbnRhaW5lciA9IG5ldyBQWENvbnRhaW5lcigpXG5cdFx0dGhpcy5weENvbnRhaW5lci5pbml0KCcjcGFnZXMtY29udGFpbmVyJylcblx0XHRBcHBBY3Rpb25zLnB4Q29udGFpbmVySXNSZWFkeSh0aGlzLnB4Q29udGFpbmVyKVxuXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0dGhpcy5pc1JlYWR5KClcblx0XHRcdHRoaXMub25SZWFkeSgpXG5cdFx0fSwgMClcblxuXHRcdEdsb2JhbEV2ZW50cy5yZXNpemUoKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUmVhZHkoKSB7XG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsIHRoaXMucmVzaXplKVxuXHRcdHRoaXMuYW5pbWF0ZSgpXG5cdH1cblx0YW5pbWF0ZSgpIHtcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlKVxuXHQgICAgdGhpcy5weENvbnRhaW5lci51cGRhdGUoKVxuXHQgICAgdGhpcy5wYWdlc0NvbnRhaW5lci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR0aGlzLmZyb250Q29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5weENvbnRhaW5lci5yZXNpemUoKVxuXHRcdHRoaXMucGFnZXNDb250YWluZXIucmVzaXplKClcblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFRlbXBsYXRlXG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgRnJvbnRDb250YWluZXIgZnJvbSAnRnJvbnRDb250YWluZXInXG5pbXBvcnQgUGFnZXNDb250YWluZXIgZnJvbSAnUGFnZXNDb250YWluZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5cbmNsYXNzIEFwcFRlbXBsYXRlTW9iaWxlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0c3VwZXIucmVuZGVyKCdBcHBUZW1wbGF0ZU1vYmlsZScsIHBhcmVudCwgdW5kZWZpbmVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdC8vIHRoaXMuZnJvbnRDb250YWluZXIgPSBuZXcgRnJvbnRDb250YWluZXIoKVxuXHRcdC8vIHRoaXMuZnJvbnRDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdC8vIHRoaXMucGFnZXNDb250YWluZXIgPSBuZXcgUGFnZXNDb250YWluZXIoKVxuXHRcdC8vIHRoaXMucGFnZXNDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdGNvbnNvbGUubG9nKCdtb2JpbGUgeW8nKVxuXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0dGhpcy5vblJlYWR5KClcblx0XHR9LCAwKVxuXG5cdFx0R2xvYmFsRXZlbnRzLnJlc2l6ZSgpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0b25SZWFkeSgpIHtcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSwgdGhpcy5yZXNpemUpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdC8vIHRoaXMucGFnZXNDb250YWluZXIucmVzaXplKClcblx0XHQvLyB0aGlzLmZyb250Q29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBUZW1wbGF0ZU1vYmlsZVxuXG4iLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBEaXNwYXRjaGVyIGZyb20gJ0FwcERpc3BhdGNoZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5cbmZ1bmN0aW9uIF9wcm9jZWVkSGFzaGVyQ2hhbmdlQWN0aW9uKHBhZ2VJZCkge1xuICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELFxuICAgICAgICBpdGVtOiBwYWdlSWRcbiAgICB9KSAgXG59XG5cbnZhciBBcHBBY3Rpb25zID0ge1xuICAgIHBhZ2VIYXNoZXJDaGFuZ2VkOiBmdW5jdGlvbihwYWdlSWQpIHtcblxuICAgICAgICB2YXIgbWFuaWZlc3QgPSBBcHBTdG9yZS5wYWdlQXNzZXRzVG9Mb2FkKClcbiAgICAgICAgaWYobWFuaWZlc3QubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgX3Byb2NlZWRIYXNoZXJDaGFuZ2VBY3Rpb24ocGFnZUlkKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIC8vIEFwcFN0b3JlLlBhZ2VzTG9hZGVyLm9wZW4oKVxuICAgICAgICAgICAgQXBwU3RvcmUuUHJlbG9hZGVyLmxvYWQobWFuaWZlc3QsICgpPT57XG4gICAgICAgICAgICAgICAgLy8gQXBwU3RvcmUuUGFnZXNMb2FkZXIuY2xvc2UoKVxuICAgICAgICAgICAgICAgIF9wcm9jZWVkSGFzaGVyQ2hhbmdlQWN0aW9uKHBhZ2VJZClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd1Jlc2l6ZTogZnVuY3Rpb24od2luZG93Vywgd2luZG93SCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsXG4gICAgICAgICAgICBpdGVtOiB7IHdpbmRvd1c6d2luZG93Vywgd2luZG93SDp3aW5kb3dIIH1cbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHB4Q29udGFpbmVySXNSZWFkeTogZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX0lTX1JFQURZLFxuICAgICAgICAgICAgaXRlbTogY29tcG9uZW50XG4gICAgICAgIH0pICAgICAgICAgICAgXG4gICAgfSxcbiAgICBweEFkZENoaWxkOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9BRERfQ0hJTEQsXG4gICAgICAgICAgICBpdGVtOiBjaGlsZFxuICAgICAgICB9KSAgICAgICAgICAgIFxuICAgIH0sXG4gICAgcHhSZW1vdmVDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfUkVNT1ZFX0NISUxELFxuICAgICAgICAgICAgaXRlbTogY2hpbGRcbiAgICAgICAgfSkgICAgICAgICAgICBcbiAgICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBBY3Rpb25zXG5cblxuICAgICAgXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ0Zyb250Q29udGFpbmVyX2hicydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBoZWFkZXJMaW5rcyBmcm9tICdoZWFkZXItbGlua3MnXG5pbXBvcnQgc29jaWFsTGlua3MgZnJvbSAnc29jaWFsLWxpbmtzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmNsYXNzIEZyb250Q29udGFpbmVyIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblxuXHRcdHRoaXMub25QYWdlQ2hhbmdlID0gdGhpcy5vblBhZ2VDaGFuZ2UuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHR2YXIgc2NvcGUgPSB7fVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cdFx0c2NvcGUuaW5mb3MgPSBBcHBTdG9yZS5nbG9iYWxDb250ZW50KClcblx0XHRzY29wZS5mYWNlYm9va1VybCA9IGdlbmVyYUluZm9zWydmYWNlYm9va191cmwnXVxuXHRcdHNjb3BlLnR3aXR0ZXJVcmwgPSBnZW5lcmFJbmZvc1sndHdpdHRlcl91cmwnXVxuXHRcdHNjb3BlLmluc3RhZ3JhbVVybCA9IGdlbmVyYUluZm9zWydpbnN0YWdyYW1fdXJsJ11cblx0XHRzY29wZS5sYWJVcmwgPSBnZW5lcmFJbmZvc1snbGFiX3VybCddXG5cdFx0c2NvcGUubWVuU2hvcFVybCA9ICdodHRwOi8vd3d3LmNhbXBlci5jb20vJytKU19sYW5nKydfJytKU19jb3VudHJ5KycvbWVuL3Nob2VzL25ldy1jb2xsZWN0aW9uJ1xuXHRcdHNjb3BlLndvbWVuU2hvcFVybCA9ICdodHRwOi8vd3d3LmNhbXBlci5jb20vJytKU19sYW5nKydfJytKU19jb3VudHJ5Kycvd29tZW4vc2hvZXMvbmV3LWNvbGxlY3Rpb24nXG5cblx0XHRzdXBlci5yZW5kZXIoJ0Zyb250Q29udGFpbmVyJywgcGFyZW50LCB0ZW1wbGF0ZSwgc2NvcGUpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUEFHRV9IQVNIRVJfQ0hBTkdFRCwgdGhpcy5vblBhZ2VDaGFuZ2UpXG5cblx0XHR0aGlzLmhlYWRlckxpbmtzID0gaGVhZGVyTGlua3ModGhpcy5lbGVtZW50KVxuXHRcdHRoaXMuc29jaWFsTGlua3MgPSBzb2NpYWxMaW5rcyh0aGlzLmVsZW1lbnQpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cblx0fVxuXHRvblBhZ2VDaGFuZ2UoKSB7XG5cdFx0dmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG5cdFx0aWYoaGFzaE9iai50eXBlID09IEFwcENvbnN0YW50cy5ESVBUWVFVRSkge1xuXHRcdFx0dGhpcy5zb2NpYWxMaW5rcy5oaWRlKClcdFx0XHRcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMuc29jaWFsTGlua3Muc2hvdygpXG5cdFx0fVxuXHR9XG5cdHJlc2l6ZSgpIHtcblxuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMuaGVhZGVyTGlua3MucmVzaXplKClcblx0XHR0aGlzLnNvY2lhbExpbmtzLnJlc2l6ZSgpXG5cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGcm9udENvbnRhaW5lclxuXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBYQ29udGFpbmVyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0aW5pdChlbGVtZW50SWQpIHtcblx0XHR0aGlzLmNsZWFyQmFjayA9IGZhbHNlXG5cblx0XHR0aGlzLmFkZCA9IHRoaXMuYWRkLmJpbmQodGhpcylcblx0XHR0aGlzLnJlbW92ZSA9IHRoaXMucmVtb3ZlLmJpbmQodGhpcylcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfQUREX0NISUxELCB0aGlzLmFkZClcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRCwgdGhpcy5yZW1vdmUpXG5cblx0XHR2YXIgcmVuZGVyT3B0aW9ucyA9IHtcblx0XHQgICAgcmVzb2x1dGlvbjogMSxcblx0XHQgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG5cdFx0ICAgIGFudGlhbGlhczogdHJ1ZVxuXHRcdH07XG5cdFx0dGhpcy5yZW5kZXJlciA9IG5ldyBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcigxLCAxLCByZW5kZXJPcHRpb25zKVxuXHRcdC8vIHRoaXMucmVuZGVyZXIgPSBuZXcgUElYSS5DYW52YXNSZW5kZXJlcigxLCAxLCByZW5kZXJPcHRpb25zKVxuXHRcdHRoaXMuY3VycmVudENvbG9yID0gMHhmZmZmZmZcblx0XHR2YXIgZWwgPSAkKGVsZW1lbnRJZClcblx0XHQkKHRoaXMucmVuZGVyZXIudmlldykuYXR0cignaWQnLCAncHgtY29udGFpbmVyJylcblx0XHRBcHBTdG9yZS5DYW52YXMgPSB0aGlzLnJlbmRlcmVyLnZpZXdcblx0XHRlbC5hcHBlbmQodGhpcy5yZW5kZXJlci52aWV3KVxuXHRcdHRoaXMuc3RhZ2UgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRcdC8vIHRoaXMuYmFja2dyb3VuZCA9IG5ldyBQSVhJLkdyYXBoaWNzKClcblx0XHQvLyB0aGlzLmRyYXdCYWNrZ3JvdW5kKHRoaXMuY3VycmVudENvbG9yKVxuXHRcdC8vIHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5iYWNrZ3JvdW5kKVxuXG5cdFx0dGhpcy5zdGF0cyA9IG5ldyBTdGF0cygpO1xuXHRcdC8vIHRoaXMuc3RhdHMuc2V0TW9kZSggMSApOyAvLyAwOiBmcHMsIDE6IG1zLCAyOiBtYlxuXG5cdFx0Ly8gYWxpZ24gdG9wLWxlZnRcblx0XHR0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXHRcdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0dGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZVsnei1pbmRleCddID0gOTk5OTk5XG5cblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0aGlzLnN0YXRzLmRvbUVsZW1lbnQgKTtcblxuXHR9XG5cdGRyYXdCYWNrZ3JvdW5kKGNvbG9yKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMuYmFja2dyb3VuZC5jbGVhcigpXG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmxpbmVTdHlsZSgwKTtcblx0XHR0aGlzLmJhY2tncm91bmQuYmVnaW5GaWxsKGNvbG9yLCAxKTtcblx0XHR0aGlzLmJhY2tncm91bmQuZHJhd1JlY3QoMCwgMCwgd2luZG93Vywgd2luZG93SCk7XG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmVuZEZpbGwoKTtcblx0fVxuXHRhZGQoY2hpbGQpIHtcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKGNoaWxkKVxuXHR9XG5cdHJlbW92ZShjaGlsZCkge1xuXHRcdHRoaXMuc3RhZ2UucmVtb3ZlQ2hpbGQoY2hpbGQpXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdHRoaXMuc3RhdHMudXBkYXRlKClcblx0ICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc3RhZ2UpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHZhciBzY2FsZSA9IDFcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdHRoaXMucmVuZGVyZXIucmVzaXplKHdpbmRvd1cgKiBzY2FsZSwgd2luZG93SCAqIHNjYWxlKVxuXHRcdC8vIHRoaXMuZHJhd0JhY2tncm91bmQodGhpcy5jdXJyZW50Q29sb3IpXG5cdH1cbn1cbiIsImltcG9ydCBCYXNlUGFnZSBmcm9tICdCYXNlUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBQeEhlbHBlciBmcm9tICdQeEhlbHBlcidcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFnZSBleHRlbmRzIEJhc2VQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcylcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0dGhpcy5weENvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRzZXRUaW1lb3V0KCgpPT57IEFwcEFjdGlvbnMucHhBZGRDaGlsZCh0aGlzLnB4Q29udGFpbmVyKSB9LCAwKVxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRkaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSB7XG5cdFx0c3VwZXIuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0c3VwZXIuc2V0dXBBbmltYXRpb25zKClcblx0fVxuXHRnZXRJbWFnZVVybEJ5SWQoaWQpIHtcblx0XHR2YXIgdXJsID0gdGhpcy5wcm9wcy5oYXNoLnR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUgPyAnaG9tZS0nICsgaWQgOiB0aGlzLnByb3BzLmhhc2gucGFyZW50ICsgJy0nICsgdGhpcy5wcm9wcy5oYXNoLnRhcmdldCArICctJyArIGlkXG5cdFx0cmV0dXJuIEFwcFN0b3JlLlByZWxvYWRlci5nZXRJbWFnZVVSTCh1cmwpXG5cdH1cblx0Z2V0SW1hZ2VTaXplQnlJZChpZCkge1xuXHRcdHZhciB1cmwgPSB0aGlzLnByb3BzLmhhc2gudHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSA/ICdob21lLScgKyBpZCA6IHRoaXMucHJvcHMuaGFzaC5wYXJlbnQgKyAnLScgKyB0aGlzLnByb3BzLmhhc2gudGFyZ2V0ICsgJy0nICsgaWRcblx0XHRyZXR1cm4gQXBwU3RvcmUuUHJlbG9hZGVyLmdldEltYWdlU2l6ZSh1cmwpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0dXBkYXRlKCkge1xuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdFB4SGVscGVyLnJlbW92ZUNoaWxkcmVuRnJvbUNvbnRhaW5lcih0aGlzLnB4Q29udGFpbmVyKVxuXHRcdHNldFRpbWVvdXQoKCk9PnsgQXBwQWN0aW9ucy5weFJlbW92ZUNoaWxkKHRoaXMucHhDb250YWluZXIpIH0sIDApXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHR9XG59XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQmFzZVBhZ2VyIGZyb20gJ0Jhc2VQYWdlcidcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IEhvbWUgZnJvbSAnSG9tZSdcbmltcG9ydCBIb21lVGVtcGxhdGUgZnJvbSAnSG9tZV9oYnMnXG5pbXBvcnQgRGlwdHlxdWUgZnJvbSAnRGlwdHlxdWUnXG5pbXBvcnQgRGlwdHlxdWVUZW1wbGF0ZSBmcm9tICdEaXB0eXF1ZV9oYnMnXG5cbmNsYXNzIFBhZ2VzQ29udGFpbmVyIGV4dGVuZHMgQmFzZVBhZ2VyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMuZGlkSGFzaGVyQ2hhbmdlID0gdGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELCB0aGlzLmRpZEhhc2hlckNoYW5nZSlcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0ZGlkSGFzaGVyQ2hhbmdlKCkge1xuXHRcdHZhciBoYXNoID0gUm91dGVyLmdldE5ld0hhc2goKVxuXHRcdHZhciB0eXBlID0gdW5kZWZpbmVkXG5cdFx0dmFyIHRlbXBsYXRlID0gdW5kZWZpbmVkXG5cdFx0c3dpdGNoKGhhc2gudHlwZSkge1xuXHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuRElQVFlRVUU6XG5cdFx0XHRcdHR5cGUgPSBEaXB0eXF1ZVxuXHRcdFx0XHR0ZW1wbGF0ZSA9IERpcHR5cXVlVGVtcGxhdGVcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkhPTUU6XG5cdFx0XHRcdHR5cGUgPSBIb21lXG5cdFx0XHRcdHRlbXBsYXRlID0gSG9tZVRlbXBsYXRlXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gSG9tZVxuXHRcdFx0XHR0ZW1wbGF0ZSA9IEhvbWVUZW1wbGF0ZVxuXHRcdH1cblx0XHR0aGlzLnNldHVwTmV3Q29tcG9uZW50KGhhc2gsIHR5cGUsIHRlbXBsYXRlKVxuXHRcdHRoaXMuY3VycmVudENvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdGlmKHRoaXMuY3VycmVudENvbXBvbmVudCAhPSB1bmRlZmluZWQpIHRoaXMuY3VycmVudENvbXBvbmVudC51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHRpZih0aGlzLmN1cnJlbnRDb21wb25lbnQgIT0gdW5kZWZpbmVkKSB0aGlzLmN1cnJlbnRDb21wb25lbnQucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYWdlc0NvbnRhaW5lclxuXG5cblxuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbnZhciBhcm91bmRCb3JkZXIgPSAocGFyZW50KT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyICRjb250YWluZXIgPSBwYXJlbnQuZmluZCgnLmFyb3VuZC1ib3JkZXItY29udGFpbmVyJylcblx0dmFyIHRvcCA9ICRjb250YWluZXIuZmluZCgnLnRvcCcpLmdldCgwKVxuXHR2YXIgYm90dG9tID0gJGNvbnRhaW5lci5maW5kKCcuYm90dG9tJykuZ2V0KDApXG5cdHZhciBsZWZ0ID0gJGNvbnRhaW5lci5maW5kKCcubGVmdCcpLmdldCgwKVxuXHR2YXIgcmlnaHQgPSAkY29udGFpbmVyLmZpbmQoJy5yaWdodCcpLmdldCgwKVxuXHR2YXIgbGVmdFN0ZXBUb3AgPSAkY29udGFpbmVyLmZpbmQoJy5sZWZ0LXN0ZXAtdG9wJykuZ2V0KDApXG5cdHZhciBsZWZ0U3RlcEJvdHRvbSA9ICRjb250YWluZXIuZmluZCgnLmxlZnQtc3RlcC1ib3R0b20nKS5nZXQoMClcblx0dmFyIHJpZ2h0U3RlcFRvcCA9ICRjb250YWluZXIuZmluZCgnLnJpZ2h0LXN0ZXAtdG9wJykuZ2V0KDApXG5cdHZhciByaWdodFN0ZXBCb3R0b20gPSAkY29udGFpbmVyLmZpbmQoJy5yaWdodC1zdGVwLWJvdHRvbScpLmdldCgwKVxuXG5cdHZhciAkbGV0dGVyc0NvbnRhaW5lciA9IHBhcmVudC5maW5kKFwiLmFyb3VuZC1ib3JkZXItbGV0dGVycy1jb250YWluZXJcIilcblx0dmFyIHRvcExldHRlcnMgPSAkbGV0dGVyc0NvbnRhaW5lci5maW5kKFwiLnRvcFwiKS5jaGlsZHJlbigpLmdldCgpXG5cdHZhciBib3R0b21MZXR0ZXJzID0gJGxldHRlcnNDb250YWluZXIuZmluZChcIi5ib3R0b21cIikuY2hpbGRyZW4oKS5nZXQoKVxuXHR2YXIgbGVmdExldHRlcnMgPSAkbGV0dGVyc0NvbnRhaW5lci5maW5kKFwiLmxlZnRcIikuY2hpbGRyZW4oKS5nZXQoKVxuXHR2YXIgcmlnaHRMZXR0ZXJzID0gJGxldHRlcnNDb250YWluZXIuZmluZChcIi5yaWdodFwiKS5jaGlsZHJlbigpLmdldCgpXG5cdHZhciBsZWZ0U3RlcFRvcExldHRlcnMgPSAkbGV0dGVyc0NvbnRhaW5lci5maW5kKCcubGVmdC1zdGVwLXRvcCcpLmNoaWxkcmVuKCkuZ2V0KClcblx0dmFyIGxlZnRTdGVwQm90dG9tTGV0dGVycyA9ICRsZXR0ZXJzQ29udGFpbmVyLmZpbmQoJy5sZWZ0LXN0ZXAtYm90dG9tJykuY2hpbGRyZW4oKS5nZXQoKVxuXHR2YXIgcmlnaHRTdGVwVG9wTGV0dGVycyA9ICRsZXR0ZXJzQ29udGFpbmVyLmZpbmQoJy5yaWdodC1zdGVwLXRvcCcpLmNoaWxkcmVuKCkuZ2V0KClcblx0dmFyIHJpZ2h0U3RlcEJvdHRvbUxldHRlcnMgPSAkbGV0dGVyc0NvbnRhaW5lci5maW5kKCcucmlnaHQtc3RlcC1ib3R0b20nKS5jaGlsZHJlbigpLmdldCgpXG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciBib3JkZXJTaXplID0gMTBcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBibG9ja1NpemUgPSBbIHdpbmRvd1cgLyBBcHBDb25zdGFudHMuR1JJRF9ST1dTLCB3aW5kb3dIIC8gQXBwQ29uc3RhbnRzLkdSSURfQ09MVU1OUyBdXG5cblx0XHRcdHRvcC5zdHlsZS53aWR0aCA9IHdpbmRvd1cgKyAncHgnXG5cdFx0XHRib3R0b20uc3R5bGUud2lkdGggPSBibG9ja1NpemVbMF0gKiAzICsgJ3B4J1xuXHRcdFx0Ym90dG9tLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBib3JkZXJTaXplICsgJ3B4J1xuXHRcdFx0Ym90dG9tLnN0eWxlLmxlZnQgPSBibG9ja1NpemVbMF0gKiAyICsgJ3B4J1xuXHRcdFx0bGVmdC5zdHlsZS5oZWlnaHQgPSByaWdodC5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdFx0cmlnaHQuc3R5bGUubGVmdCA9IHdpbmRvd1cgLSBib3JkZXJTaXplICsgJ3B4J1xuXG5cdFx0XHRsZWZ0U3RlcFRvcC5zdHlsZS53aWR0aCA9IGJsb2NrU2l6ZVswXSAqIDIgKyAncHgnXG5cdFx0XHRsZWZ0U3RlcFRvcC5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdFx0bGVmdFN0ZXBCb3R0b20uc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdFx0bGVmdFN0ZXBCb3R0b20uc3R5bGUubGVmdCA9IChibG9ja1NpemVbMF0gKiAyKSAtIGJvcmRlclNpemUgKyAxICsgJ3B4J1xuXHRcdFx0bGVmdFN0ZXBCb3R0b20uc3R5bGUudG9wID0gd2luZG93SCAtIGJsb2NrU2l6ZVsxXSArICdweCdcblxuXHRcdFx0cmlnaHRTdGVwVG9wLnN0eWxlLndpZHRoID0gYmxvY2tTaXplWzBdICogMiArICdweCdcblx0XHRcdHJpZ2h0U3RlcFRvcC5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdFx0cmlnaHRTdGVwVG9wLnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gKGJsb2NrU2l6ZVswXSAqIDIpICsgJ3B4J1xuXHRcdFx0cmlnaHRTdGVwQm90dG9tLnN0eWxlLmhlaWdodCA9IGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRcdHJpZ2h0U3RlcEJvdHRvbS5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIChibG9ja1NpemVbMF0gKiAyKSArICdweCdcblx0XHRcdHJpZ2h0U3RlcEJvdHRvbS5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRvcExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHRsID0gdG9wTGV0dGVyc1tpXVxuXHRcdFx0XHR0bC5zdHlsZS5sZWZ0ID0gKGJsb2NrU2l6ZVswXSA+PiAxKSArIChibG9ja1NpemVbMF0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdHRsLnN0eWxlLnRvcCA9IC0yICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYm90dG9tTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYmwgPSBib3R0b21MZXR0ZXJzW2ldXG5cdFx0XHRcdGJsLnN0eWxlLmxlZnQgPSAoYmxvY2tTaXplWzBdIDw8IDEpICsgKGJsb2NrU2l6ZVswXSA+PiAxKSArIChibG9ja1NpemVbMF0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdGJsLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSAxMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlZnRMZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBsbCA9IGxlZnRMZXR0ZXJzW2ldXG5cdFx0XHRcdGxsLnN0eWxlLnRvcCA9IChibG9ja1NpemVbMV0gPj4gMSkgKyAoYmxvY2tTaXplWzFdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRsbC5zdHlsZS5sZWZ0ID0gMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJpZ2h0TGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcmwgPSByaWdodExldHRlcnNbaV1cblx0XHRcdFx0cmwuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSA+PiAxKSArIChibG9ja1NpemVbMV0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdHJsLnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gOCArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlZnRTdGVwVG9wTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgbHN0bCA9IGxlZnRTdGVwVG9wTGV0dGVyc1tpXVxuXHRcdFx0XHRsc3RsLnN0eWxlLmxlZnQgPSAoYmxvY2tTaXplWzBdID4+IDEpICsgKGJsb2NrU2l6ZVswXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0bHN0bC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdICogMykgLSAyICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVmdFN0ZXBCb3R0b21MZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBsc2JsID0gbGVmdFN0ZXBCb3R0b21MZXR0ZXJzW2ldXG5cdFx0XHRcdGxzYmwuc3R5bGUubGVmdCA9IChibG9ja1NpemVbMF0gKiAyKSAtIDggKyAncHgnXG5cdFx0XHRcdGxzYmwuc3R5bGUudG9wID0gd2luZG93SCAtIChibG9ja1NpemVbMV0gPj4gMSkgLSAyICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmlnaHRTdGVwVG9wTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcnN0bCA9IHJpZ2h0U3RlcFRvcExldHRlcnNbaV1cblx0XHRcdFx0cnN0bC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIChibG9ja1NpemVbMF0gPDwgMSkgKyAoYmxvY2tTaXplWzBdID4+IDEpICsgKGJsb2NrU2l6ZVswXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0cnN0bC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdICogMykgLSAyICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmlnaHRTdGVwQm90dG9tTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcnNibCA9IHJpZ2h0U3RlcEJvdHRvbUxldHRlcnNbaV1cblx0XHRcdFx0cnNibC5zdHlsZS5sZWZ0ID0gKGJsb2NrU2l6ZVswXSAqIDUpICsgMiArICdweCdcblx0XHRcdFx0cnNibC5zdHlsZS50b3AgPSB3aW5kb3dIIC0gKGJsb2NrU2l6ZVsxXSA+PiAxKSAtIDIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdH1cblx0fSBcblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJvdW5kQm9yZGVyIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbnZhciBib3R0b21UZXh0cyA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIGJvdHRvbVRleHRzQ29udGFpbmVyID0gcGFyZW50LmZpbmQoXCIuYm90dG9tLXRleHRzLWNvbnRhaW5lclwiKVxuXHR2YXIgbGVmdEJsb2NrID0gYm90dG9tVGV4dHNDb250YWluZXIuZmluZCgnLmxlZnQtdGV4dCcpLmdldCgwKVxuXHR2YXIgcmlnaHRCbG9jayA9IGJvdHRvbVRleHRzQ29udGFpbmVyLmZpbmQoJy5yaWdodC10ZXh0JykuZ2V0KDApXG5cdHZhciBsZWZ0RnJvbnQgPSAkKGxlZnRCbG9jaykuZmluZCgnLmZyb250LXdyYXBwZXInKS5nZXQoMClcblx0dmFyIHJpZ2h0RnJvbnQgPSAkKHJpZ2h0QmxvY2spLmZpbmQoJy5mcm9udC13cmFwcGVyJykuZ2V0KDApXG5cblx0dmFyIHJlc2l6ZSA9ICgpPT4ge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR2YXIgYmxvY2tTaXplID0gWyB3aW5kb3dXIC8gQXBwQ29uc3RhbnRzLkdSSURfUk9XUywgd2luZG93SCAvIEFwcENvbnN0YW50cy5HUklEX0NPTFVNTlMgXVxuXG5cdFx0bGVmdEJsb2NrLnN0eWxlLndpZHRoID0gYmxvY2tTaXplWzBdICogMiArICdweCdcblx0XHRsZWZ0QmxvY2suc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdHJpZ2h0QmxvY2suc3R5bGUud2lkdGggPSBibG9ja1NpemVbMF0gKiAyICsgJ3B4J1xuXHRcdHJpZ2h0QmxvY2suc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXG5cdFx0bGVmdEJsb2NrLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBibG9ja1NpemVbMV0gKyAncHgnXG5cdFx0cmlnaHRCbG9jay5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdHJpZ2h0QmxvY2suc3R5bGUubGVmdCA9IHdpbmRvd1cgLSAoYmxvY2tTaXplWzBdICogMikgKyAncHgnXG5cblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHRsZWZ0RnJvbnQuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSA+PiAxKSAtIChsZWZ0RnJvbnQuY2xpZW50SGVpZ2h0ID4+IDEpICsgJ3B4J1xuXHRcdFx0cmlnaHRGcm9udC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdID4+IDEpIC0gKHJpZ2h0RnJvbnQuY2xpZW50SGVpZ2h0ID4+IDEpICsgJ3B4J1xuXHRcdFx0cmlnaHRGcm9udC5zdHlsZS5sZWZ0ID0gKChibG9ja1NpemVbMF0gPDwgMSkgPj4gMSkgLSAocmlnaHRGcm9udC5jbGllbnRXaWR0aCA+PiAxKSArICdweCdcblx0XHR9KVxuXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6IHJlc2l6ZVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGJvdHRvbVRleHRzIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5leHBvcnQgZGVmYXVsdCAoaG9sZGVyLCBjaGFyYWN0ZXJVcmwsIHRleHR1cmVTaXplKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIHRleCA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoY2hhcmFjdGVyVXJsKVxuXHR2YXIgc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRleClcblx0c3ByaXRlLmFuY2hvci54ID0gc3ByaXRlLmFuY2hvci55ID0gMC41XG5cdGhvbGRlci5hZGRDaGlsZChzcHJpdGUpXG5cblx0c2NvcGUgPSB7XG5cdFx0dXBkYXRlOiAobW91c2UpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIG5YID0gKCggKCBtb3VzZS54IC0gKCB3aW5kb3dXID4+IDEpICkgLyAoIHdpbmRvd1cgPj4gMSApICkgKiAxKSAtIDAuNVxuXHRcdFx0dmFyIG5ZID0gbW91c2UublkgLSAwLjVcblx0XHRcdHZhciBuZXd4ID0gc3ByaXRlLml4ICsgKDEwICogblgpXG5cdFx0XHR2YXIgbmV3eSA9IHNwcml0ZS5peSArICgxMCAqIG5ZKVxuXHRcdFx0c3ByaXRlLnggKz0gKG5ld3ggLSBzcHJpdGUueCkgKiAwLjAzXG5cdFx0XHRzcHJpdGUueSArPSAobmV3eSAtIHNwcml0ZS55KSAqIDAuMDNcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBzaXplID0gWyh3aW5kb3dXID4+IDEpICsgMSwgd2luZG93SF1cblxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0dmFyIHNjYWxlID0gKCh3aW5kb3dIIC0gMTAwKSAvIHRleHR1cmVTaXplLmhlaWdodCkgKiAxXG5cdFx0XHRcdHNwcml0ZS5zY2FsZS54ID0gc3ByaXRlLnNjYWxlLnkgPSBzY2FsZVxuXHRcdFx0XHRzcHJpdGUueCA9IHNpemVbMF0gPj4gMVxuXHRcdFx0XHRzcHJpdGUueSA9IHNpemVbMV0gLSAoKHRleHR1cmVTaXplLmhlaWdodCAqIHNjYWxlKSA+PiAxKSArIDEwXG5cdFx0XHRcdHNwcml0ZS5peCA9IHNwcml0ZS54XG5cdFx0XHRcdHNwcml0ZS5peSA9IHNwcml0ZS55XG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxuZXhwb3J0IGRlZmF1bHQgKHB4Q29udGFpbmVyLCBiZ1VybCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXG5cdHZhciBob2xkZXIgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRweENvbnRhaW5lci5hZGRDaGlsZChob2xkZXIpXG5cblx0dmFyIG1hc2sgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXHRob2xkZXIuYWRkQ2hpbGQobWFzaylcblxuXHR2YXIgYmdUZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShiZ1VybClcblx0dmFyIHNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZShiZ1RleHR1cmUpXG5cdHNwcml0ZS5hbmNob3IueCA9IHNwcml0ZS5hbmNob3IueSA9IDAuNVxuXHRob2xkZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXG5cdHNwcml0ZS5tYXNrID0gbWFza1xuXG5cdHNjb3BlID0ge1xuXHRcdGhvbGRlcjogaG9sZGVyLFxuXHRcdGJnU3ByaXRlOiBzcHJpdGUsXG5cdFx0dXBkYXRlOiAobW91c2UpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIG5YID0gKCggKCBtb3VzZS54IC0gKCB3aW5kb3dXID4+IDEpICkgLyAoIHdpbmRvd1cgPj4gMSApICkgKiAxKSAtIDAuNVxuXHRcdFx0dmFyIG5ZID0gbW91c2UublkgLSAwLjVcblx0XHRcdHZhciBuZXd4ID0gc3ByaXRlLml4IC0gKDMwICogblgpXG5cdFx0XHR2YXIgbmV3eSA9IHNwcml0ZS5peSAtICgyMCAqIG5ZKVxuXHRcdFx0c3ByaXRlLnggKz0gKG5ld3ggLSBzcHJpdGUueCkgKiAwLjAwOFxuXHRcdFx0c3ByaXRlLnkgKz0gKG5ld3kgLSBzcHJpdGUueSkgKiAwLjAwOFxuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblxuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHR2YXIgc2l6ZSA9IFsod2luZG93VyA+PiAxKSArIDEsIHdpbmRvd0hdXG5cblx0XHRcdG1hc2suY2xlYXIoKVxuXHRcdFx0bWFzay5iZWdpbkZpbGwoMHhmZjAwMDAsIDEpO1xuXHRcdFx0bWFzay5kcmF3UmVjdCgwLCAwLCBzaXplWzBdLCBzaXplWzFdKTtcblx0XHRcdG1hc2suZW5kRmlsbCgpO1xuXG5cdFx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkoc2l6ZVswXSwgc2l6ZVsxXSwgOTYwLCAxMDI0KVxuXG5cdFx0XHRzcHJpdGUueCA9IHNpemVbMF0gPj4gMVxuXHRcdFx0c3ByaXRlLnkgPSBzaXplWzFdID4+IDFcblx0XHRcdHNwcml0ZS5zY2FsZS54ID0gc3ByaXRlLnNjYWxlLnkgPSByZXNpemVWYXJzLnNjYWxlICsgMC4xXG5cdFx0XHRzcHJpdGUuaXggPSBzcHJpdGUueFxuXHRcdFx0c3ByaXRlLml5ID0gc3ByaXRlLnlcblxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0cHhDb250YWluZXIucmVtb3ZlQ2hpbGQoaG9sZGVyKVxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRzcHJpdGUuZGVzdHJveSgpXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCB2aWRlb0NhbnZhcyBmcm9tICd2aWRlby1jYW52YXMnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxudmFyIGdyaWQgPSAocHJvcHMsIHBhcmVudCwgb25JdGVtRW5kZWQpPT4ge1xuXG5cdHZhciB2aWRlb0VuZGVkID0gKGl0ZW0pPT4ge1xuXHRcdG9uSXRlbUVuZGVkKGl0ZW0pXG5cdFx0c2NvcGUudHJhbnNpdGlvbk91dEl0ZW0oaXRlbSlcblx0fVxuXG5cdHZhciBpbWFnZUVuZGVkID0gKGl0ZW0pPT4ge1xuXHRcdG9uSXRlbUVuZGVkKGl0ZW0pXG5cdFx0c2NvcGUudHJhbnNpdGlvbk91dEl0ZW0oaXRlbSlcblx0fVxuXG5cdHZhciAkZ3JpZENvbnRhaW5lciA9IHBhcmVudC5maW5kKFwiLmdyaWQtY29udGFpbmVyXCIpXG5cdHZhciBncmlkQ2hpbGRyZW4gPSAkZ3JpZENvbnRhaW5lci5jaGlsZHJlbigpLmdldCgpXG5cdHZhciBsaW5lc0hvcml6b250YWwgPSBwYXJlbnQuZmluZChcIi5saW5lcy1ncmlkLWNvbnRhaW5lciAuaG9yaXpvbnRhbC1saW5lc1wiKS5jaGlsZHJlbigpLmdldCgpXG5cdHZhciBsaW5lc1ZlcnRpY2FsID0gcGFyZW50LmZpbmQoXCIubGluZXMtZ3JpZC1jb250YWluZXIgLnZlcnRpY2FsLWxpbmVzXCIpLmNoaWxkcmVuKCkuZ2V0KClcblx0dmFyIHNjb3BlO1xuXHR2YXIgY3VycmVudFNlYXQ7XG5cdHZhciBpdGVtcyA9IFtdXG5cdHZhciB0b3RhbE51bSA9IHByb3BzLmRhdGEuZ3JpZC5sZW5ndGhcblx0dmFyIHZpZGVvcyA9IEFwcFN0b3JlLmdldEhvbWVWaWRlb3MoKVxuXG5cdHZhciB2Q2FudmFzUHJvcHMgPSB7XG5cdFx0YXV0b3BsYXk6IGZhbHNlLFxuXHRcdHZvbHVtZTogMCxcblx0XHRsb29wOiBmYWxzZSxcblx0XHRvbkVuZGVkOiB2aWRlb0VuZGVkXG5cdH1cblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsTnVtOyBpKyspIHtcblx0XHR2YXIgdlBhcmVudCA9IGdyaWRDaGlsZHJlbltpXVxuXHRcdHZhciB2aWRlb0luZGV4ID0gaSAlIHZpZGVvcy5sZW5ndGhcblx0XHR2YXIgdkNhbnZhcyA9IHZpZGVvQ2FudmFzKCB2aWRlb3NbdmlkZW9JbmRleF0sIHZDYW52YXNQcm9wcyApXG5cdFx0dlBhcmVudC5hcHBlbmRDaGlsZCh2Q2FudmFzLmNhbnZhcylcblx0XHRpdGVtc1tpXSA9IHZDYW52YXNcblx0fVxuXG5cdHZhciByZXNpemUgPSAoKT0+IHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dmFyIG9yaWdpbmFsVmlkZW9TaXplID0gQXBwQ29uc3RhbnRzLkhPTUVfVklERU9fU0laRVxuXHRcdHZhciBibG9ja1NpemUgPSBbIHdpbmRvd1cgLyBBcHBDb25zdGFudHMuR1JJRF9ST1dTLCB3aW5kb3dIIC8gQXBwQ29uc3RhbnRzLkdSSURfQ09MVU1OUyBdXG5cblx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkoYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0sIG9yaWdpbmFsVmlkZW9TaXplWzBdLCBvcmlnaW5hbFZpZGVvU2l6ZVsxXSlcblxuXHRcdHZhciBwb3MgPSBbIDAsIDAgXVxuXHRcdHZhciBob3Jpem9udGFsTGluZXNJbmRleCA9IDBcblx0XHR2YXIgdmVydGljYWxMaW5lc0luZGV4ID0gMFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2NvcGUubnVtOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gc2NvcGUuaXRlbXNbaV1cblx0XHRcdHZhciBwYXJlbnQgPSBzY29wZS5jaGlsZHJlbltpXVxuXG5cdFx0XHRwYXJlbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0XHRwYXJlbnQuc3R5bGUud2lkdGggPSBibG9ja1NpemVbIDAgXSArICdweCdcblx0XHRcdHBhcmVudC5zdHlsZS5oZWlnaHQgPSBibG9ja1NpemVbIDEgXSArICdweCdcblx0XHRcdHBhcmVudC5zdHlsZS5sZWZ0ID0gcG9zWyAwIF0gKyAncHgnXG5cdFx0XHRwYXJlbnQuc3R5bGUudG9wID0gcG9zWyAxIF0gKyAncHgnXG5cdFx0XHRcblx0XHRcdGl0ZW0uY2FudmFzLndpZHRoID0gYmxvY2tTaXplWyAwIF1cblx0XHRcdGl0ZW0uY2FudmFzLmhlaWdodCA9IGJsb2NrU2l6ZVsgMSBdXG5cdFx0XHRpdGVtLnJlc2l6ZShyZXNpemVWYXJzLmxlZnQsIHJlc2l6ZVZhcnMudG9wLCByZXNpemVWYXJzLndpZHRoLCByZXNpemVWYXJzLmhlaWdodClcblx0XHRcdGl0ZW0uZHJhd09uY2UoKVxuXHRcdFx0XG5cdFx0XHRpZihpID4gMCkge1xuXHRcdFx0XHR2YXIgdmwgPSBzY29wZS5saW5lcy52ZXJ0aWNhbFt2ZXJ0aWNhbExpbmVzSW5kZXhdXG5cdFx0XHRcdGlmKHZsKSB2bC5zdHlsZS5sZWZ0ID0gcG9zWyAwIF0gKyAncHgnXG5cdFx0XHRcdHZlcnRpY2FsTGluZXNJbmRleCArPSAxXG5cdFx0XHR9XG5cblx0XHRcdC8vIHBvc2l0aW9uc1xuXHRcdFx0c2NvcGUucG9zaXRpb25zWyBpIF0gPSBbIHBvc1sgMCBdLCBwb3NbIDEgXSBdXG5cdFx0XHRwb3NbIDAgXSArPSBibG9ja1NpemVbIDAgXVxuXHRcdFx0aWYoIHBvc1sgMCBdID4gd2luZG93VyAtIChibG9ja1NpemVbIDAgXSA+PiAxKSApIHtcblx0XHRcdFx0XG5cdFx0XHRcdHBvc1sgMSBdICs9IGJsb2NrU2l6ZVsgMSBdXG5cdFx0XHRcdHBvc1sgMCBdID0gMFxuXG5cdFx0XHRcdHZhciBobCA9IHNjb3BlLmxpbmVzLmhvcml6b250YWxbaG9yaXpvbnRhbExpbmVzSW5kZXhdXG5cdFx0XHRcdGlmKGhsKSBobC5zdHlsZS50b3AgPSBwb3NbIDEgXSArICdweCdcblx0XHRcdFx0aG9yaXpvbnRhbExpbmVzSW5kZXggKz0gMVxuXHRcdFx0fVxuXHRcdH07XG5cblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiAkZ3JpZENvbnRhaW5lcixcblx0XHRjaGlsZHJlbjogZ3JpZENoaWxkcmVuLFxuXHRcdGl0ZW1zOiBpdGVtcyxcblx0XHRudW06IHRvdGFsTnVtLFxuXHRcdHBvc2l0aW9uczogW10sXG5cdFx0bGluZXM6IHtcblx0XHRcdGhvcml6b250YWw6IGxpbmVzSG9yaXpvbnRhbCxcblx0XHRcdHZlcnRpY2FsOiBsaW5lc1ZlcnRpY2FsXG5cdFx0fSxcblx0XHRyZXNpemU6IHJlc2l6ZSxcblx0XHR0cmFuc2l0aW9uSW5JdGVtOiAoaW5kZXgsIHR5cGUpPT4ge1xuXHRcdFx0dmFyIGl0ZW0gPSBzY29wZS5pdGVtc1tpbmRleF1cblx0XHRcdGl0ZW0uc2VhdCA9IGluZGV4XG5cblx0XHRcdGl0ZW0uY2FudmFzLmNsYXNzTGlzdC5hZGQoJ2VuYWJsZScpXG5cdFx0XHRcblx0XHRcdGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLklURU1fVklERU8pIHtcblx0XHRcdFx0aXRlbS5wbGF5KClcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRpdGVtLnRpbWVvdXQoaW1hZ2VFbmRlZCwgMjAwMClcblx0XHRcdFx0aXRlbS5zZWVrKFV0aWxzLlJhbmQoMiwgMTAsIDApKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dHJhbnNpdGlvbk91dEl0ZW06IChpdGVtKT0+IHtcblx0XHRcdGl0ZW0uY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2VuYWJsZScpXG5cblx0XHRcdGl0ZW0udmlkZW8uY3VycmVudFRpbWUgPSAwXG5cdFx0XHRpdGVtLnBhdXNlKClcblx0XHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdFx0aXRlbS5kcmF3T25jZSgpXG5cdFx0XHR9LCA1MDApXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGl0ZW1zW2ldLmNsZWFyKClcblx0XHRcdH07XG5cdFx0fVxuXHR9IFxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBncmlkIiwiLypcblx0d2lkdGg6IHdpZHRoIG9mIGdyaWRcblx0aGVpZ2h0OiBoZWlnaHQgb2YgZ3JpZFxuXHRyb3dzOiBudW1iZXIgb2Ygcm93c1xuXHRjb2x1bW5zOiBudW1iZXIgb2YgY29sdW1uc1xuKi9cblxuZXhwb3J0IGRlZmF1bHQgKHdpZHRoLCBoZWlnaHQsIHJvd3MsIGNvbHVtbnMpPT4ge1xuXG5cdHZhciBibG9ja1NpemUgPSBbIHdpZHRoIC8gY29sdW1ucywgaGVpZ2h0IC8gcm93cyBdXG5cdHZhciBibG9ja3NMZW4gPSByb3dzICogY29sdW1uc1xuXHR2YXIgcG9zaXRpb25zID0gW11cblx0XG5cdHZhciBwb3NYID0gMFxuXHR2YXIgcG9zWSA9IDBcblx0dmFyIGNvbHVtbkNvdW50ZXIgPSAwXG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibG9ja3NMZW47IGkrKykge1xuXG5cdFx0aWYoY29sdW1uQ291bnRlciA+PSBjb2x1bW5zKSB7XG5cdFx0XHRwb3NYID0gMFxuXHRcdFx0cG9zWSArPSBibG9ja1NpemVbMV1cblx0XHRcdGNvbHVtbkNvdW50ZXIgPSAwXG5cdFx0fVxuXHRcdHZhciBiID0gW3Bvc1gsIHBvc1ldXG5cblx0XHRwb3NYICs9IGJsb2NrU2l6ZVswXVxuXHRcdGNvbHVtbkNvdW50ZXIgKz0gMVxuXG5cdFx0cG9zaXRpb25zW2ldID0gYlxuXHR9O1xuXG5cdHJldHVybiB7XG5cdFx0cm93czogcm93cyxcblx0XHRjb2x1bW5zOiBjb2x1bW5zLFxuXHRcdGJsb2NrU2l6ZTogYmxvY2tTaXplLFxuXHRcdHBvc2l0aW9uczogcG9zaXRpb25zXG5cdH1cbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxudmFyIGhlYWRlckxpbmtzID0gKHBhcmVudCk9PiB7XG5cdHZhciBzY29wZTtcblxuXHR2YXIgb25TdWJNZW51TW91c2VFbnRlciA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgJHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KVxuXHRcdCR0YXJnZXQuYWRkQ2xhc3MoJ2hvdmVyZWQnKVxuXHR9XG5cdHZhciBvblN1Yk1lbnVNb3VzZUxlYXZlID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpXG5cdFx0JHRhcmdldC5yZW1vdmVDbGFzcygnaG92ZXJlZCcpXG5cdH1cblxuXHR2YXIgY2FtcGVyTGFiRWwgPSBwYXJlbnQuZmluZCgnLmNhbXBlci1sYWInKS5nZXQoMClcblx0dmFyIHNob3BFbCA9IHBhcmVudC5maW5kKCcuc2hvcC13cmFwcGVyJykuZ2V0KDApXG5cdHZhciBtYXBFbCA9IHBhcmVudC5maW5kKCcubWFwLWJ0bicpLmdldCgwKVxuXG5cdHNob3BFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25TdWJNZW51TW91c2VFbnRlcilcblx0c2hvcEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvblN1Yk1lbnVNb3VzZUxlYXZlKVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgcGFkZGluZyA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCAvIDNcblxuXHRcdFx0dmFyIGNhbXBlckxhYkNzcyA9IHtcblx0XHRcdFx0bGVmdDogd2luZG93VyAtIChBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKiAwLjYpIC0gcGFkZGluZyAtICQoY2FtcGVyTGFiRWwpLndpZHRoKCksXG5cdFx0XHRcdHRvcDogQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5ELFxuXHRcdFx0fVxuXHRcdFx0dmFyIHNob3BDc3MgPSB7XG5cdFx0XHRcdGxlZnQ6IGNhbXBlckxhYkNzcy5sZWZ0IC0gJChzaG9wRWwpLndpZHRoKCkgLSBwYWRkaW5nLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblx0XHRcdHZhciBtYXBDc3MgPSB7XG5cdFx0XHRcdGxlZnQ6IHNob3BDc3MubGVmdCAtICQobWFwRWwpLndpZHRoKCkgLSBwYWRkaW5nLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblxuXHRcdFx0Y2FtcGVyTGFiRWwuc3R5bGUubGVmdCA9IGNhbXBlckxhYkNzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0Y2FtcGVyTGFiRWwuc3R5bGUudG9wID0gY2FtcGVyTGFiQ3NzLnRvcCArICdweCdcblx0XHRcdHNob3BFbC5zdHlsZS5sZWZ0ID0gc2hvcENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0c2hvcEVsLnN0eWxlLnRvcCA9IHNob3BDc3MudG9wICsgJ3B4J1xuXHRcdFx0bWFwRWwuc3R5bGUubGVmdCA9IG1hcENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0bWFwRWwuc3R5bGUudG9wID0gbWFwQ3NzLnRvcCArICdweCdcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgaGVhZGVyTGlua3MiLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5cbmV4cG9ydCBkZWZhdWx0IChob2xkZXIsIHNob2VVcmwsIHRleHR1cmVTaXplKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIHRleCA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2Uoc2hvZVVybClcblx0dmFyIHNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0ZXgpXG5cdHNwcml0ZS5hbmNob3IueCA9IHNwcml0ZS5hbmNob3IueSA9IDAuNVxuXHRob2xkZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXG5cdHNjb3BlID0ge1xuXHRcdHVwZGF0ZTogKG1vdXNlKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciBuWCA9ICgoICggbW91c2UueCAtICggd2luZG93VyA+PiAxKSApIC8gKCB3aW5kb3dXID4+IDEgKSApICogMSkgLSAwLjVcblx0XHRcdHZhciBuWSA9IG1vdXNlLm5ZIC0gMC41XG5cdFx0XHR2YXIgbmV3eCA9IHNwcml0ZS5peCArICgzMCAqIG5YKVxuXHRcdFx0dmFyIG5ld3kgPSBzcHJpdGUuaXkgLSAoMjAgKiBuWSlcblx0XHRcdHNwcml0ZS54ICs9IChuZXd4IC0gc3ByaXRlLngpICogMC4wOFxuXHRcdFx0c3ByaXRlLnkgKz0gKG5ld3kgLSBzcHJpdGUueSkgKiAwLjA2XG5cdFx0fSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHR2YXIgc2l6ZSA9IFsod2luZG93VyA+PiAxKSArIDEsIHdpbmRvd0hdXG5cblx0XHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRcdHZhciBzY2FsZSA9ICgod2luZG93SCAtIDQwMCkgLyB0ZXh0dXJlU2l6ZS5oZWlnaHQpICogMVxuXHRcdFx0XHRzcHJpdGUuc2NhbGUueCA9IHNwcml0ZS5zY2FsZS55ID0gc2NhbGVcblx0XHRcdFx0c3ByaXRlLnggPSBzaXplWzBdID4+IDFcblx0XHRcdFx0c3ByaXRlLnkgPSBzaXplWzFdID4+IDFcblx0XHRcdFx0c3ByaXRlLml4ID0gc3ByaXRlLnhcblx0XHRcdFx0c3ByaXRlLml5ID0gc3ByaXRlLnlcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmV4cG9ydCBkZWZhdWx0IChwYXJlbnQpID0+IHtcblxuXHR2YXIgb25Eb3RDbGljayA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgaWQgPSBlLnRhcmdldC5pZFxuXHRcdHZhciBwYXJlbnRJZCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXJlbnQtaWQnKVxuXHRcdFJvdXRlci5zZXRIYXNoKHBhcmVudElkICsgJy8nICsgaWQpXG5cdH1cblxuXHR2YXIgc2NvcGU7XG5cdHZhciAkZWwgPSBwYXJlbnQuZmluZCgnLm1hcC13cmFwcGVyJylcblx0dmFyIGVsID0gJGVsLmdldCgwKVxuXHR2YXIgdGl0bGVzV3JhcHBlciA9ICRlbC5maW5kKCcudGl0bGVzLXdyYXBwZXInKS5nZXQoMClcblx0dmFyIG1hcGRvdHMgPSAkZWwuZmluZCgnI21hcC1kb3RzIHBhdGgnKS5nZXQoKVxuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbWFwZG90cy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBkb3QgPSBtYXBkb3RzW2ldXG5cdFx0ZG90LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25Eb3RDbGljaylcblx0fTtcblxuXHR2YXIgdGl0bGVzID0ge1xuXHRcdCdkZWlhJzoge1xuXHRcdFx0ZWw6ICQodGl0bGVzV3JhcHBlcikuZmluZChcIi5kZWlhXCIpLmdldCgwKVxuXHRcdH0sXG5cdFx0J2VzLXRyZW5jJzoge1xuXHRcdFx0ZWw6ICQodGl0bGVzV3JhcHBlcikuZmluZChcIi5lcy10cmVuY1wiKS5nZXQoMClcblx0XHR9LFxuXHRcdCdhcmVsbHVmJzoge1xuXHRcdFx0ZWw6ICQodGl0bGVzV3JhcHBlcikuZmluZChcIi5hcmVsbHVmXCIpLmdldCgwKVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHRpdGxlUG9zWChwYXJlbnRXLCB2YWwpIHtcblx0XHRyZXR1cm4gKHBhcmVudFcgLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cpICogdmFsXG5cdH1cblx0ZnVuY3Rpb24gdGl0bGVQb3NZKHBhcmVudEgsIHZhbCkge1xuXHRcdHJldHVybiAocGFyZW50SCAvIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSCkgKiB2YWxcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBtYXBXID0gNjkzLCBtYXBIID0gNjQ1XG5cdFx0XHR2YXIgbWFwU2l6ZSA9IFtdXG5cdFx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93VyowLjQ3LCB3aW5kb3dIKjAuNDcsIG1hcFcsIG1hcEgpXG5cdFx0XHRtYXBTaXplWzBdID0gbWFwVyAqIHJlc2l6ZVZhcnMuc2NhbGVcblx0XHRcdG1hcFNpemVbMV0gPSBtYXBIICogcmVzaXplVmFycy5zY2FsZVxuXG5cdFx0XHRlbC5zdHlsZS53aWR0aCA9IG1hcFNpemVbMF0gKyAncHgnXG5cdFx0XHRlbC5zdHlsZS5oZWlnaHQgPSBtYXBTaXplWzFdICsgJ3B4J1xuXHRcdFx0ZWwuc3R5bGUubGVmdCA9ICh3aW5kb3dXID4+IDEpIC0gKG1hcFNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHRlbC5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChtYXBTaXplWzFdID4+IDEpICsgJ3B4J1xuXG5cdFx0XHR0aXRsZXNbJ2RlaWEnXS5lbC5zdHlsZS5sZWZ0ID0gdGl0bGVQb3NYKG1hcFNpemVbMF0sIDY0MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2RlaWEnXS5lbC5zdHlsZS50b3AgPSB0aXRsZVBvc1kobWFwU2l6ZVsxXSwgMjgwKSArICdweCdcblx0XHRcdHRpdGxlc1snZXMtdHJlbmMnXS5lbC5zdHlsZS5sZWZ0ID0gdGl0bGVQb3NYKG1hcFNpemVbMF0sIDExODApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydlcy10cmVuYyddLmVsLnN0eWxlLnRvcCA9IHRpdGxlUG9zWShtYXBTaXplWzFdLCA3NjApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydhcmVsbHVmJ10uZWwuc3R5bGUubGVmdCA9IHRpdGxlUG9zWChtYXBTaXplWzBdLCAyMTApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydhcmVsbHVmJ10uZWwuc3R5bGUudG9wID0gdGl0bGVQb3NZKG1hcFNpemVbMV0sIDQ2MCkgKyAncHgnXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGRvdCA9IG1hcGRvdHNbaV1cblx0XHRcdFx0ZG90LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25Eb3RDbGljaylcblx0XHRcdH07XG5cdFx0XHR0aXRsZXMgPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBQYWdlIGZyb20gJ1BhZ2UnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZGlwdHlxdWVQYXJ0IGZyb20gJ2RpcHR5cXVlLXBhcnQnXG5pbXBvcnQgY2hhcmFjdGVyIGZyb20gJ2NoYXJhY3RlcidcbmltcG9ydCBzaG9lIGZyb20gJ21haW4tc2hvZSdcbmltcG9ydCBzaG9lc0hvbGRlciBmcm9tICdzaG9lcy1ob2xkZXInXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpcHR5cXVlIGV4dGVuZHMgUGFnZSB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpXG5cblx0XHR0aGlzLm9uTW91c2VNb3ZlID0gdGhpcy5vbk1vdXNlTW92ZS5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cblx0XHR0aGlzLm1vdXNlID0gbmV3IFBJWEkuUG9pbnQoKVxuXHRcdHRoaXMubW91c2UublggPSB0aGlzLm1vdXNlLm5ZID0gMFxuXG5cdFx0dGhpcy5sZWZ0UGFydCA9IGRpcHR5cXVlUGFydChcblx0XHRcdHRoaXMucHhDb250YWluZXIsXG5cdFx0XHR0aGlzLmdldEltYWdlVXJsQnlJZCgnc2hvZS1iZycpLFxuXHRcdFx0XG5cdFx0KVxuXHRcdHRoaXMucmlnaHRQYXJ0ID0gZGlwdHlxdWVQYXJ0KFxuXHRcdFx0dGhpcy5weENvbnRhaW5lcixcblx0XHRcdHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdjaGFyYWN0ZXItYmcnKVxuXHRcdClcblxuXHRcdHRoaXMuY2hhcmFjdGVyID0gY2hhcmFjdGVyKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgdGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2NoYXJhY3RlcicpLCB0aGlzLmdldEltYWdlU2l6ZUJ5SWQoJ2NoYXJhY3RlcicpKVxuXHRcdHRoaXMuc2hvZSA9IHNob2UodGhpcy5sZWZ0UGFydC5ob2xkZXIsIHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdzaG9lJyksIHRoaXMuZ2V0SW1hZ2VTaXplQnlJZCgnc2hvZScpKVxuXHRcdHRoaXMuc2hvZXNIb2xkZXIgPSBzaG9lc0hvbGRlcih0aGlzLnB4Q29udGFpbmVyKVxuXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpXG5cblx0XHRzZXRUaW1lb3V0KCgpPT50aGlzLnNob2VzSG9sZGVyLm9wZW4oKSwgMjAwMClcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMubGVmdFBhcnQuaG9sZGVyLCAxLCB7IHg6IC13aW5kb3dXID4+IDEsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmxlZnRQYXJ0LmJnU3ByaXRlLCAxLCB7IHg6IHRoaXMubGVmdFBhcnQuYmdTcHJpdGUueCAtIDIwMCwgZWFzZTpFeHBvLmVhc2VPdXQgfSwgMC41KVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMubGVmdFBhcnQuYmdTcHJpdGUuc2NhbGUsIDEsIHsgeDogMywgZWFzZTpFeHBvLmVhc2VPdXQgfSwgMC40KVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgMSwgeyB4OiB3aW5kb3dXLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5yaWdodFBhcnQuYmdTcHJpdGUsIDEsIHsgeDogdGhpcy5yaWdodFBhcnQuYmdTcHJpdGUueCArIDIwMCwgZWFzZTpFeHBvLmVhc2VPdXQgfSwgMC41KVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMucmlnaHRQYXJ0LmJnU3ByaXRlLnNjYWxlLCAxLCB7IHg6IDMsIGVhc2U6RXhwby5lYXNlT3V0IH0sIDAuNClcblxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5sZWZ0UGFydC5ob2xkZXIsIDEsIHsgeDogLXdpbmRvd1cgPj4gMSwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5yaWdodFBhcnQuaG9sZGVyLCAxLCB7IHg6IHdpbmRvd1csIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblxuXHRcdHN1cGVyLnNldHVwQW5pbWF0aW9ucygpXG5cdH1cblx0d2lsbFRyYW5zaXRpb25JbigpIHtcblx0XHRBcHBTdG9yZS5DYW52YXMuc3R5bGVbJ3otaW5kZXgnXSA9IDRcblx0XHRzdXBlci53aWxsVHJhbnNpdGlvbkluKClcblx0fVxuXHRvbk1vdXNlTW92ZShlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHR0aGlzLm1vdXNlLnggPSBlLmNsaWVudFhcblx0XHR0aGlzLm1vdXNlLnkgPSBlLmNsaWVudFlcblx0XHR0aGlzLm1vdXNlLm5YID0gKGUuY2xpZW50WCAvIHdpbmRvd1cpICogMVxuXHRcdHRoaXMubW91c2UublkgPSAoZS5jbGllbnRZIC8gd2luZG93SCkgKiAxXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdHRoaXMuY2hhcmFjdGVyLnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHRoaXMuc2hvZS51cGRhdGUodGhpcy5tb3VzZSlcblx0XHR0aGlzLmxlZnRQYXJ0LnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHRoaXMucmlnaHRQYXJ0LnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHN1cGVyLnVwZGF0ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR0aGlzLmxlZnRQYXJ0LnJlc2l6ZSgpXG5cdFx0dGhpcy5yaWdodFBhcnQucmVzaXplKClcblx0XHR0aGlzLmNoYXJhY3Rlci5yZXNpemUoKVxuXHRcdHRoaXMuc2hvZS5yZXNpemUoKVxuXHRcdHRoaXMuc2hvZXNIb2xkZXIucmVzaXplKClcblxuXHRcdHRoaXMucmlnaHRQYXJ0LmhvbGRlci54ID0gKHdpbmRvd1cgPj4gMSlcblxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy5sZWZ0UGFydC5jbGVhcigpXG5cdFx0dGhpcy5yaWdodFBhcnQuY2xlYXIoKVxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KClcblx0fVxufVxuXG4iLCJpbXBvcnQgUGFnZSBmcm9tICdQYWdlJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IGJvdHRvbVRleHRzIGZyb20gJ2JvdHRvbS10ZXh0cy1ob21lJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZ3JpZCBmcm9tICdncmlkLWhvbWUnXG5pbXBvcnQgYXJvdW5kQm9yZGVyIGZyb20gJ2Fyb3VuZC1ib3JkZXItaG9tZSdcbmltcG9ydCBtYXAgZnJvbSAnbWFwLWhvbWUnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvbWUgZXh0ZW5kcyBQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHR2YXIgY29udGVudCA9IEFwcFN0b3JlLnBhZ2VDb250ZW50KClcblx0XHRwcm9wcy5kYXRhLmdyaWQgPSBbXVxuXHRcdHByb3BzLmRhdGEuZ3JpZC5sZW5ndGggPSAyOFxuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXSA9IHsgaG9yaXpvbnRhbDogW10sIHZlcnRpY2FsOiBbXSB9XG5cdFx0cHJvcHMuZGF0YVsnbGluZXMtZ3JpZCddLmhvcml6b250YWwubGVuZ3RoID0gM1xuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXS52ZXJ0aWNhbC5sZW5ndGggPSA2XG5cdFx0cHJvcHMuZGF0YVsndGV4dF9hJ10gPSBjb250ZW50LnRleHRzWyd0eHRfYSddXG5cdFx0cHJvcHMuZGF0YVsnYV92aXNpb24nXSA9IGNvbnRlbnQudGV4dHNbJ2FfdmlzaW9uJ11cblx0XHRzdXBlcihwcm9wcylcblx0XHR2YXIgYmdVcmwgPSB0aGlzLmdldEltYWdlVXJsQnlJZCgnYmFja2dyb3VuZCcpXG5cdFx0dGhpcy5wcm9wcy5kYXRhLmJndXJsID0gYmdVcmxcblxuXHRcdHRoaXMudHJpZ2dlck5ld0l0ZW0gPSB0aGlzLnRyaWdnZXJOZXdJdGVtLmJpbmQodGhpcylcblx0XHR0aGlzLm9uSXRlbUVuZGVkID0gdGhpcy5vbkl0ZW1FbmRlZC5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQgPSBmYWxzZVxuXHRcdHRoaXMubGFzdEdyaWRJdGVtSW5kZXg7XG5cdFx0dGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID0gMjAwXG5cdFx0dGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyID0gMFxuXG5cdFx0dGhpcy5zZWF0cyA9IFtcblx0XHRcdDAsIDEsIDIsIDMsIDQsIDUsIDYsXG5cdFx0XHQ3LCA4LCA5LCAxMCwgMTEsIDEyLCAxMyxcblx0XHRcdDE0LCAxNSwgMTYsIDE3LCAxOCwgMTksIDIwLFxuXHRcdFx0MjMsIDI0LCAyNVxuXHRcdF1cblxuXHRcdHRoaXMudXNlZFNlYXRzID0gW11cblxuXHRcdHRoaXMuYmcgPSB0aGlzLmVsZW1lbnQuZmluZChcIi5iZy13cmFwcGVyXCIpLmdldCgwKVxuXG5cdFx0dGhpcy5ncmlkID0gZ3JpZCh0aGlzLnByb3BzLCB0aGlzLmVsZW1lbnQsIHRoaXMub25JdGVtRW5kZWQpXG5cdFx0dGhpcy5ib3R0b21UZXh0cyA9IGJvdHRvbVRleHRzKHRoaXMuZWxlbWVudClcblx0XHR0aGlzLmFyb3VuZEJvcmRlciA9IGFyb3VuZEJvcmRlcih0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5tYXAgPSBtYXAodGhpcy5lbGVtZW50KVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdHRyaWdnZXJOZXdJdGVtKHR5cGUpIHtcblx0XHR2YXIgaW5kZXggPSB0aGlzLnNlYXRzW1V0aWxzLlJhbmQoMCwgdGhpcy5zZWF0cy5sZW5ndGggLSAxLCAwKV1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudXNlZFNlYXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgc2VhdCA9IHRoaXMudXNlZFNlYXRzW2ldXG5cdFx0XHRpZihzZWF0ID09IGluZGV4KSB7XG5cdFx0XHRcdGlmKHRoaXMudXNlZFNlYXRzLmxlbmd0aCA8IHRoaXMuc2VhdHMubGVuZ3RoIC0gMikgdGhpcy50cmlnZ2VyTmV3SXRlbSh0eXBlKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMudXNlZFNlYXRzLnB1c2goaW5kZXgpXG5cdFx0dGhpcy5ncmlkLnRyYW5zaXRpb25Jbkl0ZW0oaW5kZXgsIHR5cGUpXG5cdH1cblx0b25JdGVtRW5kZWQoaXRlbSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy51c2VkU2VhdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciB1c2VkU2VhdCA9IHRoaXMudXNlZFNlYXRzW2ldXG5cdFx0XHRpZih1c2VkU2VhdCA9PSBpdGVtLnNlYXQpIHtcblx0XHRcdFx0dGhpcy51c2VkU2VhdHMuc3BsaWNlKGksIDEpXG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHR0aGlzLnRyYW5zaXRpb25JbkNvbXBsZXRlZCA9IHRydWVcblx0XHRBcHBTdG9yZS5DYW52YXMuc3R5bGVbJ3otaW5kZXgnXSA9IDBcblx0XHRzdXBlci5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdGlmKCF0aGlzLnRyYW5zaXRpb25JbkNvbXBsZXRlZCkgcmV0dXJuXG5cdFx0dGhpcy52aWRlb1RyaWdnZXJDb3VudGVyICs9IDFcblx0XHRpZih0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgPiA4MDApIHtcblx0XHRcdHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciA9IDBcblx0XHRcdHRoaXMudHJpZ2dlck5ld0l0ZW0oQXBwQ29uc3RhbnRzLklURU1fVklERU8pXG5cdFx0fVxuXHRcdHRoaXMuaW1hZ2VUcmlnZ2VyQ291bnRlciArPSAxXG5cdFx0aWYodGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyID4gMzApIHtcblx0XHRcdHRoaXMuaW1hZ2VUcmlnZ2VyQ291bnRlciA9IDBcblx0XHRcdHRoaXMudHJpZ2dlck5ld0l0ZW0oQXBwQ29uc3RhbnRzLklURU1fSU1BR0UpXG5cdFx0fVxuXHRcdHN1cGVyLnVwZGF0ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XG5cdFx0dGhpcy5ncmlkLnJlc2l6ZSgpXG5cdFx0dGhpcy5ib3R0b21UZXh0cy5yZXNpemUoKVxuXHRcdHRoaXMuYXJvdW5kQm9yZGVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5tYXAucmVzaXplKClcblxuXHRcdHZhciByZXNpemVWYXJzQmcgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHdpbmRvd1csIHdpbmRvd0gsIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfVywgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9IKVxuXG5cdFx0Ly8gYmdcblx0XHR0aGlzLmJnLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXHRcdHRoaXMuYmcuc3R5bGUud2lkdGggPSByZXNpemVWYXJzQmcud2lkdGggKyAncHgnXG5cdFx0dGhpcy5iZy5zdHlsZS5oZWlnaHQgPSByZXNpemVWYXJzQmcuaGVpZ2h0ICsgJ3B4J1xuXHRcdHRoaXMuYmcuc3R5bGUudG9wID0gcmVzaXplVmFyc0JnLnRvcCArICdweCdcblx0XHR0aGlzLmJnLnN0eWxlLmxlZnQgPSByZXNpemVWYXJzQmcubGVmdCArICdweCdcblxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy5ncmlkLmNsZWFyKClcblx0XHR0aGlzLm1hcC5jbGVhcigpXG5cblx0XHR0aGlzLmdyaWQgPSBudWxsXG5cdFx0dGhpcy5ib3R0b21UZXh0cyA9IG51bGxcblx0XHR0aGlzLmFyb3VuZEJvcmRlciA9IG51bGxcblx0XHR0aGlzLm1hcCA9IG51bGxcblxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KClcblx0fVxufVxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZ3JpZFBvc2l0aW9ucyBmcm9tICdncmlkLXBvc2l0aW9ucydcbmltcG9ydCBpbWcgZnJvbSAnaW1nJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmV4cG9ydCBkZWZhdWx0IChwYXJlbnQpPT4ge1xuXHR2YXIgc2NvcGU7XG5cblx0dmFyIHVybHMgPSBBcHBTdG9yZS5kaXB0eXF1ZVNob2VzKClcblx0dmFyIGxvYWRlZCA9IDBcblx0dmFyIHNwcml0ZXMgPSBbXVxuXHR2YXIgZ3JpZDtcblx0dmFyIGJpZ0ltZ1cgPSAwXG5cdHZhciBhbGxJbWdMb2FkZWQgPSBmYWxzZVxuXG5cdHZhciBob2xkZXIgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRwYXJlbnQuYWRkQ2hpbGQoaG9sZGVyKVxuXG5cdHZhciBiZyA9IG5ldyBQSVhJLkdyYXBoaWNzKClcblx0aG9sZGVyLmFkZENoaWxkKGJnKVxuXG5cdHZhciBzaG9lc0hvbGRlciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdGhvbGRlci5hZGRDaGlsZChzaG9lc0hvbGRlcilcblxuXHR2YXIgc3ByaXRlcyA9IFtdXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciB1cmwgPSB1cmxzW2ldXG5cdFx0dmFyIGlkID0gVXRpbHMuR2V0SW1nVXJsSWQodXJsKVxuXHRcdHZhciBjID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0XHR2YXIgc3BydCA9IG5ldyBQSVhJLlNwcml0ZSgpXG5cdFx0Yy5hZGRDaGlsZChzcHJ0KVxuXHRcdHNob2VzSG9sZGVyLmFkZENoaWxkKGMpXG5cdFx0c3ByaXRlc1tpXSA9IHtcblx0XHRcdHVybDogdXJsLFxuXHRcdFx0aWQ6IGlkLFxuXHRcdFx0Y29udGFpbmVyOiBjLFxuXHRcdFx0c3ByaXRlOiBzcHJ0XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBnZXRTcHJpdGVCeUlkID0gKGlkKT0+IHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNwcml0ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBzcHJ0ID0gc3ByaXRlc1tpXVxuXHRcdFx0aWYoaWQgPT0gc3BydC5pZCkgcmV0dXJuIHNwcnRcblx0XHR9O1xuXHR9XG5cblx0dmFyIHNldHVwU3ByaXRlcyA9ICgpPT4ge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHRleCA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UodXJsc1tpXSlcblx0XHRcdHZhciBjID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0XHRcdC8vIHZhciBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGV4KVxuXHRcdFx0dmFyIHNwcml0ZSA9IHNwcml0ZXNbaV0uc3ByaXRlXG5cdFx0XHRzcHJpdGUudGV4dHVyZSA9IHRleFxuXHRcdFx0c3ByaXRlc1tpXS5jb250YWluZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXHRcdFx0c3ByaXRlLmFuY2hvci54ID0gc3ByaXRlLmFuY2hvci55ID0gMC41XG5cdFx0XHQvLyBzcHJpdGVzW2ldLnNwcml0ZSA9IHNwcml0ZVxuXHRcdH1cblx0fVxuXG5cdHZhciByZXNpemVTcHJpdGVzID0gKCk9PiB7XG5cdFx0dmFyIHBvc2l0aW9ucyA9IGdyaWQucG9zaXRpb25zXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzcHJpdGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgY29udGFpbmVyID0gc3ByaXRlc1tpXS5jb250YWluZXJcblx0XHRcdHZhciBwb3MgPSBwb3NpdGlvbnNbaV1cblx0XHRcdHZhciByZXNpemVWYXJzID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseShncmlkLmJsb2NrU2l6ZVswXSwgZ3JpZC5ibG9ja1NpemVbMV0sIHNwcml0ZXNbaV0uaW1nLndpZHRoLCBzcHJpdGVzW2ldLmltZy5oZWlnaHQsIEFwcENvbnN0YW50cy5MQU5EU0NBUEUpXG5cdFx0XHRjb250YWluZXIueCA9IHBvc1swXSArIChncmlkLmJsb2NrU2l6ZVswXSA+PiAxKVxuXHRcdFx0Y29udGFpbmVyLnkgPSBwb3NbMV0gKyAoZ3JpZC5ibG9ja1NpemVbMV0gPj4gMSlcblx0XHRcdGNvbnRhaW5lci5zY2FsZS54ID0gY29udGFpbmVyLnNjYWxlLnkgPSByZXNpemVWYXJzLnNjYWxlIC0gMC4zXG5cdFx0fTtcblx0fVxuXG5cdHZhciBpbWdMb2FkZWQgPSAoZXJyb3IsIGVsKT0+IHtcblx0XHRsb2FkZWQrK1xuXG5cdFx0dmFyIHNyYyA9IGVsLnNyY1xuXHRcdHZhciBzcHJ0ID0gZ2V0U3ByaXRlQnlJZChVdGlscy5HZXRJbWdVcmxJZChzcmMpKVxuXHRcdHNwcnQuaW1nID0gZWxcblxuXHRcdGlmKGJpZ0ltZ1cgPCBlbC53aWR0aCkgYmlnSW1nVyA9IGVsLndpZHRoXG5cdFx0aWYobG9hZGVkID09IHVybHMubGVuZ3RoKSB7XG5cdFx0XHRhbGxJbWdMb2FkZWQgPSB0cnVlXG5cdFx0XHRzZXR1cFNwcml0ZXMoKVxuXHRcdFx0c2NvcGUucmVzaXplKClcblx0XHR9XG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRzcHJpdGVzOiBzcHJpdGVzLFxuXHRcdGhvbGRlcjogaG9sZGVyLFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgc2l6ZSA9IFsod2luZG93VyA+PiAxKSArIDEsIHdpbmRvd0hdXG5cdFx0XHR2YXIgZ3JpZFNpemUgPSBbc2l6ZVswXSowLjYsIHNpemVbMV0qMC44XVxuXHRcdFx0Z3JpZCA9IGdyaWRQb3NpdGlvbnMoZ3JpZFNpemVbMF0sIGdyaWRTaXplWzFdLCAzLCAxKVxuXG5cdFx0XHRiZy5jbGVhcigpXG5cdFx0XHRiZy5iZWdpbkZpbGwoMHhmZmZmZmYsIDEpO1xuXHRcdFx0YmcuZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRiZy5lbmRGaWxsKCk7XG5cblx0XHRcdGlmKCFhbGxJbWdMb2FkZWQpIHJldHVyblxuXHRcdFx0cmVzaXplU3ByaXRlcygpXG5cdFx0XHRzaG9lc0hvbGRlci54ID0gKHNpemVbMF0gPj4gMSkgLSAoZ3JpZFNpemVbMF0gPj4gMSlcblx0XHRcdHNob2VzSG9sZGVyLnkgPSAoc2l6ZVsxXSA+PiAxKSAtIChncmlkU2l6ZVsxXSA+PiAxKVxuXHRcdH0sXG5cdFx0bG9hZDogKCk9PiB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHVybHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHVybCA9IHVybHNbaV1cblx0XHRcdFx0aW1nKHVybCwgaW1nTG9hZGVkKVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5pbXBvcnQgc2hvZXNHcmlkIGZyb20gJ3Nob2VzLWdyaWQnXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lcik9PiB7XG5cdHZhciBzY29wZTtcblxuXHR2YXIgaG9sZGVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0cHhDb250YWluZXIuYWRkQ2hpbGQoaG9sZGVyKVxuXG5cdHZhciBiZ0NvbG9ycyA9IFtdXG5cdGJnQ29sb3JzLmxlbmd0aCA9IDVcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGJnQ29sb3JzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGJnQ29sb3IgPSBuZXcgUElYSS5HcmFwaGljcygpXG5cdFx0YmdDb2xvcnNbaV0gPSBiZ0NvbG9yXG5cdFx0aG9sZGVyLmFkZENoaWxkKGJnQ29sb3IpXG5cdH07XG5cblx0dmFyIHNHcmlkID0gc2hvZXNHcmlkKGhvbGRlcilcblx0c0dyaWQubG9hZCgpXG5cblx0dmFyIHRsID0gbmV3IFRpbWVsaW5lTGl0ZSgpXG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiAoKT0+e1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHR2YXIgc2l6ZSA9IFsod2luZG93VyA+PiAxKSArIDEsIHdpbmRvd0hdXG5cblx0XHRcdHNHcmlkLnJlc2l6ZSgpXG5cblx0XHRcdHRsLmNsZWFyKClcblxuXHRcdFx0dmFyIGluaXRpYWxTID0gODdcblx0XHRcdHZhciB2ID0gOTJcblx0XHRcdHZhciBsaWdodFN0ZXAgPSBNYXRoLnJvdW5kKGluaXRpYWxTIC8gYmdDb2xvcnMubGVuZ3RoKVxuXHRcdFx0dmFyIGRlbGF5ID0gMC4xMlxuXHRcdFx0dmFyIGxlbiA9IGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHR2YXIgYmdDb2xvciA9IGJnQ29sb3JzW2ldXG5cdFx0XHRcdHZhciBzID0gaW5pdGlhbFMgLSAobGlnaHRTdGVwKmkpIC0gbGlnaHRTdGVwXG5cdFx0XHRcdGlmKHMgPD0gMCkge1xuXHRcdFx0XHRcdHMgPSAwXG5cdFx0XHRcdFx0diA9IDEwMFxuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBjID0gJzB4JyArIGNvbG9yVXRpbHMuaHN2VG9IZXgoMTQ3LCBzLCB2KVxuXHRcdFx0XHRiZ0NvbG9yLmNsZWFyKClcblx0XHRcdFx0YmdDb2xvci5iZWdpbkZpbGwoYywgMSk7XG5cdFx0XHRcdGJnQ29sb3IuZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRcdGJnQ29sb3IuZW5kRmlsbCgpO1xuXG5cdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeTotd2luZG93SCB9LCB7IHk6d2luZG93SCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCBkZWxheSppKVxuXHRcdFx0fTtcblxuXHRcdFx0dGwuZnJvbShzR3JpZC5ob2xkZXIsIDEsIHsgeTotd2luZG93SCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCBkZWxheSpsZW4pXG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc0dyaWQuc3ByaXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgc3BydCA9IHNHcmlkLnNwcml0ZXNbaV1cblx0XHRcdFx0dGwuZnJvbShzcHJ0LnNwcml0ZS5zY2FsZSwgMSwgeyB4OjAsIHk6MCwgZWFzZTpCYWNrLmVhc2VPdXQgfSwgZGVsYXkqbGVuICsgMC40ICsgKGkqMC4xKSlcblx0XHRcdH07XG5cblx0XHRcdHRsLnBhdXNlKDApXG5cdFx0fSxcblx0XHRvcGVuOiAoKT0+IHtcblx0XHRcdHRsLnBsYXkoMClcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbnZhciBzb2NpYWxMaW5rcyA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIHdyYXBwZXIgPSBwYXJlbnQuZmluZChcIiNmb290ZXIgI3NvY2lhbC13cmFwcGVyXCIpLmdldCgwKVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgcGFkZGluZyA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCAqIDAuNFxuXG5cdFx0XHR2YXIgc29jaWFsQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiB3aW5kb3dXIC0gcGFkZGluZyAtICQod3JhcHBlcikud2lkdGgoKSxcblx0XHRcdFx0dG9wOiB3aW5kb3dIIC0gcGFkZGluZyAtICQod3JhcHBlcikuaGVpZ2h0KCksXG5cdFx0XHR9XG5cblx0XHRcdHdyYXBwZXIuc3R5bGUubGVmdCA9IHNvY2lhbENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0d3JhcHBlci5zdHlsZS50b3AgPSBzb2NpYWxDc3MudG9wICsgJ3B4J1xuXHRcdH0sXG5cdFx0c2hvdzogKCk9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpPT4kKHdyYXBwZXIpLnJlbW92ZUNsYXNzKCdoaWRlJyksIDEwMDApXG5cdFx0fSxcblx0XHRoaWRlOiAoKT0+IHtcblx0XHRcdHNldFRpbWVvdXQoKCk9PiQod3JhcHBlcikuYWRkQ2xhc3MoJ2hpZGUnKSwgNTAwKVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBzb2NpYWxMaW5rcyIsIlxudmFyIHZpZGVvQ2FudmFzID0gKCBzcmMsIHByb3BzICk9PiB7XG5cblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHR2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdHZhciB2aWRlbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XG5cdHZhciBpbnRlcnZhbElkO1xuXHR2YXIgZHggPSAwLCBkeSA9IDAsIGRXaWR0aCA9IDAsIGRIZWlnaHQgPSAwO1xuXHR2YXIgaXNQbGF5aW5nID0gcHJvcHMuYXV0b3BsYXkgfHwgZmFsc2Vcblx0dmFyIHNjb3BlO1xuXG5cdHZhciBvbkNhblBsYXkgPSAoKT0+e1xuXHRcdGlmKHByb3BzLmF1dG9wbGF5KSB2aWRlby5wbGF5KClcblx0XHRpZihwcm9wcy52b2x1bWUgIT0gdW5kZWZpbmVkKSB2aWRlby52b2x1bWUgPSBwcm9wcy52b2x1bWVcblx0XHRpZihkV2lkdGggPT0gMCkgZFdpZHRoID0gdmlkZW8udmlkZW9XaWR0aFxuXHRcdGlmKGRIZWlnaHQgPT0gMCkgZEhlaWdodCA9IHZpZGVvLnZpZGVvSGVpZ2h0XG5cdFx0aWYoaXNQbGF5aW5nICE9IHRydWUpIGRyYXdPbmNlKClcblx0XHR2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5Jywgb25DYW5QbGF5KTtcbiAgICAgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBvbkNhblBsYXkpO1xuXHR9XG5cblx0dmFyIGRyYXdPbmNlID0gKCk9PiB7XG5cdFx0Y3R4LmRyYXdJbWFnZSh2aWRlbywgZHgsIGR5LCBkV2lkdGgsIGRIZWlnaHQpXG5cdH1cblxuICAgIHZhciBkcmF3ID0gKCk9PntcbiAgICBcdGN0eC5kcmF3SW1hZ2UodmlkZW8sIGR4LCBkeSwgZFdpZHRoLCBkSGVpZ2h0KVxuICAgIH1cblxuICAgIHZhciBwbGF5ID0gKCk9PntcbiAgICBcdGlzUGxheWluZyA9IHRydWVcbiAgICBcdHZpZGVvLnBsYXkoKVxuICAgIFx0Y2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgIFx0aW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGRyYXcsIDEwMDAgLyAzMClcbiAgICB9XG5cbiAgICB2YXIgc2VlayA9ICh0aW1lKT0+IHtcbiAgICBcdHZpZGVvLmN1cnJlbnRUaW1lID0gdGltZVxuICAgIFx0ZHJhd09uY2UoKVxuICAgIH1cblxuICAgIHZhciB0aW1lb3V0ID0gKGNiLCBtcyk9PiB7XG4gICAgXHRzZXRUaW1lb3V0KCgpPT4ge1xuICAgIFx0XHRjYihzY29wZSlcbiAgICBcdH0sIG1zKVxuICAgIH1cblxuICAgIHZhciBwYXVzZSA9ICgpPT57XG4gICAgXHRpc1BsYXlpbmcgPSBmYWxzZVxuICAgIFx0dmlkZW8ucGF1c2UoKVxuICAgIFx0Y2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgIH1cblxuICAgIHZhciBlbmRlZCA9ICgpPT57XG4gICAgXHRpZihwcm9wcy5sb29wKSBwbGF5KClcbiAgICBcdGlmKHByb3BzLm9uRW5kZWQgIT0gdW5kZWZpbmVkKSBwcm9wcy5vbkVuZGVkKHNjb3BlKVxuICAgIFx0Y2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgIH1cblxuICAgIHZhciByZXNpemUgPSAoeCwgeSwgdywgaCk9PntcbiAgICBcdGR4ID0geFxuICAgIFx0ZHkgPSB5XG4gICAgXHRkV2lkdGggPSB3XG4gICAgXHRkSGVpZ2h0ID0gaFxuICAgIH1cblxuICAgIHZhciBjbGVhciA9ICgpPT4ge1xuICAgIFx0Y2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgIFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheSk7XG5cdCAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG5cdCAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdwbGF5JywgcGxheSlcblx0ICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BhdXNlJywgcGF1c2UpXG5cdCAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdlbmRlZCcsIGVuZGVkKVxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsMCwwLDApXG4gICAgfVxuXG5cdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdwbGF5JywgcGxheSlcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdwYXVzZScsIHBhdXNlKVxuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgZW5kZWQpXG5cblx0dmlkZW8uc3JjID0gc3JjXG5cblx0c2NvcGUgPSB7XG5cdFx0Y2FudmFzOiBjYW52YXMsXG5cdFx0dmlkZW86IHZpZGVvLFxuXHRcdGN0eDogY3R4LFxuXHRcdGRyYXdPbmNlOiBkcmF3T25jZSxcblx0XHRwbGF5OiBwbGF5LFxuXHRcdHBhdXNlOiBwYXVzZSxcblx0XHRzZWVrOiBzZWVrLFxuXHRcdHRpbWVvdXQ6IHRpbWVvdXQsXG5cdFx0cmVzaXplOiByZXNpemUsXG5cdFx0Y2xlYXI6IGNsZWFyXG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuXG5leHBvcnQgZGVmYXVsdCB2aWRlb0NhbnZhcyIsImV4cG9ydCBkZWZhdWx0IHtcblx0V0lORE9XX1JFU0laRTogJ1dJTkRPV19SRVNJWkUnLFxuXHRQQUdFX0hBU0hFUl9DSEFOR0VEOiAnUEFHRV9IQVNIRVJfQ0hBTkdFRCcsXG5cblx0TEFORFNDQVBFOiAnTEFORFNDQVBFJyxcblx0UE9SVFJBSVQ6ICdQT1JUUkFJVCcsXG5cblx0SE9NRTogJ0hPTUUnLFxuXHRESVBUWVFVRTogJ0RJUFRZUVVFJyxcblxuXHRQWF9DT05UQUlORVJfSVNfUkVBRFk6ICdQWF9DT05UQUlORVJfSVNfUkVBRFknLFxuXHRQWF9DT05UQUlORVJfQUREX0NISUxEOiAnUFhfQ09OVEFJTkVSX0FERF9DSElMRCcsXG5cdFBYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQ6ICdQWF9DT05UQUlORVJfUkVNT1ZFX0NISUxEJyxcblxuXHRIT01FX1ZJREVPX1NJWkU6IFsgNjQwLCAzNjAgXSxcblxuXHRJVEVNX0lNQUdFOiAnSVRFTV9JTUFHRScsXG5cdElURU1fVklERU86ICdJVEVNX1ZJREVPJyxcblxuXHRHUklEX1JPV1M6IDcsIFxuXHRHUklEX0NPTFVNTlM6IDQsXG5cblx0UEFERElOR19BUk9VTkQ6IDQwLFxuXG5cdEVOVklST05NRU5UUzoge1xuXHRcdFBSRVBST0Q6IHtcblx0XHRcdHN0YXRpYzogJydcblx0XHR9LFxuXHRcdFBST0Q6IHtcblx0XHRcdFwic3RhdGljXCI6IEpTX3VybF9zdGF0aWMgKyAnLydcblx0XHR9XG5cdH0sXG5cblx0TUVESUFfR0xPQkFMX1c6IDE5MjAsXG5cdE1FRElBX0dMT0JBTF9IOiAxMDgwLFxuXG5cdE1JTl9NSURETEVfVzogOTYwLFxuXHRNUV9YU01BTEw6IDMyMCxcblx0TVFfU01BTEw6IDQ4MCxcblx0TVFfTUVESVVNOiA3NjgsXG5cdE1RX0xBUkdFOiAxMDI0LFxuXHRNUV9YTEFSR0U6IDEyODAsXG5cdE1RX1hYTEFSR0U6IDE2ODAsXG59IiwiaW1wb3J0IEZsdXggZnJvbSAnZmx1eCdcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbidcblxudmFyIEFwcERpc3BhdGNoZXIgPSBhc3NpZ24obmV3IEZsdXguRGlzcGF0Y2hlcigpLCB7XG5cdGhhbmRsZVZpZXdBY3Rpb246IGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0c291cmNlOiAnVklFV19BQ1RJT04nLFxuXHRcdFx0YWN0aW9uOiBhY3Rpb25cblx0XHR9KTtcblx0fVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEFwcERpc3BhdGNoZXIiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz0ncGFnZS13cmFwcGVyIGRpcHR5cXVlLXBhZ2UnPlxcblxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIGFsaWFzMz1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzND1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiPGRpdj5cXG5cdFxcblx0PGhlYWRlciBpZD1cXFwiaGVhZGVyXFxcIj5cXG5cdFx0XHQ8YSBocmVmPVxcXCJodHRwOi8vd3d3LmNhbXBlci5jb20vXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgY2xhc3M9XFxcImxvZ29cXFwiPlxcblx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIGlkPVxcXCJMYXllcl8xXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDEzNi4wMTMgNDkuMzc1XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04Mi4xNDEsOC4wMDJoMy4zNTRjMS4yMTMsMCwxLjcxNywwLjQ5OSwxLjcxNywxLjcyNXY3LjEzN2MwLDEuMjMxLTAuNTAxLDEuNzM2LTEuNzA1LDEuNzM2aC0zLjM2NVY4LjAwMnogTTgyLjUyMywyNC42MTd2OC40MjZsLTcuMDg3LTAuMzg0VjEuOTI1SDg3LjM5YzMuMjkyLDAsNS45NiwyLjcwNSw1Ljk2LDYuMDQ0djEwLjYwNGMwLDMuMzM4LTIuNjY4LDYuMDQ0LTUuOTYsNi4wNDRIODIuNTIzeiBNMzMuNDkxLDcuOTEzYy0xLjEzMiwwLTIuMDQ4LDEuMDY1LTIuMDQ4LDIuMzc5djExLjI1Nmg0LjQwOVYxMC4yOTJjMC0xLjMxNC0wLjkxNy0yLjM3OS0yLjA0Ny0yLjM3OUgzMy40OTF6IE0zMi45OTQsMC45NzRoMS4zMDhjNC43MDIsMCw4LjUxNCwzLjg2Niw4LjUxNCw4LjYzNHYyNS4yMjRsLTYuOTYzLDEuMjczdi03Ljg0OGgtNC40MDlsMC4wMTIsOC43ODdsLTYuOTc0LDIuMDE4VjkuNjA4QzI0LjQ4MSw0LjgzOSwyOC4yOTIsMC45NzQsMzIuOTk0LDAuOTc0IE0xMjEuOTMzLDcuOTIxaDMuNDIzYzEuMjE1LDAsMS43MTgsMC40OTcsMS43MTgsMS43MjR2OC4xOTRjMCwxLjIzMi0wLjUwMiwxLjczNi0xLjcwNSwxLjczNmgtMy40MzZWNy45MjF6IE0xMzMuNzE4LDMxLjA1NXYxNy40ODdsLTYuOTA2LTMuMzY4VjMxLjU5MWMwLTQuOTItNC41ODgtNS4wOC00LjU4OC01LjA4djE2Ljc3NGwtNi45ODMtMi45MTRWMS45MjVoMTIuMjMxYzMuMjkxLDAsNS45NTksMi43MDUsNS45NTksNi4wNDR2MTEuMDc3YzAsMi4yMDctMS4yMTcsNC4xNTMtMi45OTEsNS4xMTVDMTMxLjc2MSwyNC44OTQsMTMzLjcxOCwyNy4wNzcsMTMzLjcxOCwzMS4wNTUgTTEwLjgwOSwwLjgzM2MtNC43MDMsMC04LjUxNCwzLjg2Ni04LjUxNCw4LjYzNHYyNy45MzZjMCw0Ljc2OSw0LjAxOSw4LjYzNCw4LjcyMiw4LjYzNGwxLjMwNi0wLjA4NWM1LjY1NS0xLjA2Myw4LjMwNi00LjYzOSw4LjMwNi05LjQwN3YtOC45NGgtNi45OTZ2OC43MzZjMCwxLjQwOS0wLjA2NCwyLjY1LTEuOTk0LDIuOTkyYy0xLjIzMSwwLjIxOS0yLjQxNy0wLjgxNi0yLjQxNy0yLjEzMlYxMC4xNTFjMC0xLjMxNCwwLjkxNy0yLjM4MSwyLjA0Ny0yLjM4MWgwLjMxNWMxLjEzLDAsMi4wNDgsMS4wNjcsMi4wNDgsMi4zODF2OC40NjRoNi45OTZWOS40NjdjMC00Ljc2OC0zLjgxMi04LjYzNC04LjUxNC04LjYzNEgxMC44MDkgTTEwMy45NTMsMjMuMTYyaDYuOTc3di02Ljc0NGgtNi45NzdWOC40MjNsNy42NzYtMC4wMDJWMS45MjRIOTYuNzJ2MzMuMjc4YzAsMCw1LjIyNSwxLjE0MSw3LjUzMiwxLjY2NmMxLjUxNywwLjM0Niw3Ljc1MiwyLjI1Myw3Ljc1MiwyLjI1M3YtNy4wMTVsLTguMDUxLTEuNTA4VjIzLjE2MnogTTQ2Ljg3OSwxLjkyN2wwLjAwMywzMi4zNWw3LjEyMy0wLjg5NVYxOC45ODVsNS4xMjYsMTAuNDI2bDUuMTI2LTEwLjQ4NGwwLjAwMiwxMy42NjRsNy4wMjItMC4wNTRWMS44OTVoLTcuNTQ1TDU5LjEzLDE0LjZMNTQuNjYxLDEuOTI3SDQ2Ljg3OXpcXFwiLz48L3N2Zz5cXG5cdFx0XHQ8L2E+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwibWFwLWJ0blxcXCI+PGEgaHJlZj1cXFwiIyEvbGFuZGluZ1xcXCIgY2xhc3M9XFxcInNpbXBsZS10ZXh0LWJ0blxcXCI+PGRpdiBjbGFzcz1cXFwidGV4dC13cmFwXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubWFwX3R4dCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2PjwvYT48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjYW1wZXItbGFiXFxcIj48YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYlVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsYWJVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwic2ltcGxlLXRleHQtYnRuXFxcIj48ZGl2IGNsYXNzPVxcXCJ0ZXh0LXdyYXBcXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5jYW1wZXJfbGFiIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+PC9hPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInNob3Atd3JhcHBlciBidG5cXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwic2hvcC10aXRsZSBzaW1wbGUtdGV4dC1idG5cXFwiPjxkaXYgY2xhc3M9XFxcInRleHQtd3JhcFxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfdGl0bGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj48L2Rpdj5cXG5cdFx0XHRcdDx1bCBjbGFzcz1cXFwic3VibWVudS13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdFx0PGxpIGNsYXNzPVxcXCJzdWItMFxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9J1wiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5tZW5TaG9wVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZW5TaG9wVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJtZW5TaG9wVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIic+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfbWVuIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz1cXFwic3ViLTFcXFwiPjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPSdcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMud29tZW5TaG9wVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC53b21lblNob3BVcmwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMzKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM0ID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIndvbWVuU2hvcFVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCInPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX3dvbWVuIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcdFx0XHQ8L3VsPlxcblx0XHRcdDwvZGl2Plxcblx0XHQ8L2hlYWRlcj5cXG5cdFx0PGZvb3RlciBpZD1cXFwiZm9vdGVyXFxcIiBjbGFzcz1cXFwiYnRuXFxcIj5cXG5cdFx0XHQ8ZGl2IGlkPVxcXCJzb2NpYWwtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHQ8dWw+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz0naW5zdGFncmFtJz5cXG5cdFx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmluc3RhZ3JhbVVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5zdGFncmFtVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJpbnN0YWdyYW1VcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxOCAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTggMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0xNi4xMDcsMTUuNTYyYzAsMC4zMDItMC4yNDMsMC41NDctMC41NDMsMC41NDdIMi40MzhjLTAuMzAyLDAtMC41NDctMC4yNDUtMC41NDctMC41NDdWNy4zNTloMi4xODhjLTAuMjg1LDAuNDEtMC4zODEsMS4xNzUtMC4zODEsMS42NjFjMCwyLjkyOSwyLjM4OCw1LjMxMiw1LjMyMyw1LjMxMmMyLjkzNSwwLDUuMzIyLTIuMzgzLDUuMzIyLTUuMzEyYzAtMC40ODYtMC4wNjYtMS4yNC0wLjQyLTEuNjYxaDIuMTg2VjE1LjU2MkwxNi4xMDcsMTUuNTYyeiBNOS4wMiw1LjY2M2MxLjg1NiwwLDMuMzY1LDEuNTA0LDMuMzY1LDMuMzU4YzAsMS44NTQtMS41MDksMy4zNTctMy4zNjUsMy4zNTdjLTEuODU3LDAtMy4zNjUtMS41MDQtMy4zNjUtMy4zNTdDNS42NTUsNy4xNjcsNy4xNjMsNS42NjMsOS4wMiw1LjY2M0w5LjAyLDUuNjYzeiBNMTIuODI4LDIuOTg0YzAtMC4zMDEsMC4yNDQtMC41NDYsMC41NDUtMC41NDZoMS42NDNjMC4zLDAsMC41NDksMC4yNDUsMC41NDksMC41NDZ2MS42NDFjMCwwLjMwMi0wLjI0OSwwLjU0Ny0wLjU0OSwwLjU0N2gtMS42NDNjLTAuMzAxLDAtMC41NDUtMC4yNDUtMC41NDUtMC41NDdWMi45ODRMMTIuODI4LDIuOTg0eiBNMTUuNjY5LDAuMjVIMi4zM2MtMS4xNDgsMC0yLjA4LDAuOTI5LTIuMDgsMi4wNzZ2MTMuMzQ5YzAsMS4xNDYsMC45MzIsMi4wNzUsMi4wOCwyLjA3NWgxMy4zMzljMS4xNSwwLDIuMDgxLTAuOTMsMi4wODEtMi4wNzVWMi4zMjZDMTcuNzUsMS4xNzksMTYuODE5LDAuMjUsMTUuNjY5LDAuMjVMMTUuNjY5LDAuMjV6XFxcIi8+XFxuXHRcdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9J3R3aXR0ZXInPlxcblx0XHRcdFx0XHRcdDxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudHdpdHRlclVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudHdpdHRlclVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwidHdpdHRlclVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDIyIDE4XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAyMiAxOFxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCIgZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTIxLjE3NiwwLjUxNGMtMC44NTQsMC41MDktMS43OTksMC44NzktMi44MDgsMS4wNzljLTAuODA1LTAuODY1LTEuOTUzLTEuNDA1LTMuMjI2LTEuNDA1Yy0yLjQzOCwwLTQuNDE3LDEuOTkyLTQuNDE3LDQuNDQ5YzAsMC4zNDksMC4wMzgsMC42ODgsMC4xMTQsMS4wMTNDNy4xNjYsNS40NjQsMy45MSwzLjY5NSwxLjcyOSwxYy0wLjM4LDAuNjYtMC41OTgsMS40MjUtMC41OTgsMi4yNGMwLDEuNTQzLDAuNzgsMi45MDQsMS45NjYsMy43MDRDMi4zNzQsNi45MiwxLjY5MSw2LjcxOCwxLjA5NCw2LjM4OHYwLjA1NGMwLDIuMTU3LDEuNTIzLDMuOTU3LDMuNTQ3LDQuMzYzYy0wLjM3MSwwLjEwNC0wLjc2MiwwLjE1Ny0xLjE2NSwwLjE1N2MtMC4yODUsMC0wLjU2My0wLjAyNy0wLjgzMy0wLjA4YzAuNTYzLDEuNzY3LDIuMTk0LDMuMDU0LDQuMTI4LDMuMDg5Yy0xLjUxMiwxLjE5NC0zLjQxOCwxLjkwNi01LjQ4OSwxLjkwNmMtMC4zNTYsMC0wLjcwOS0wLjAyMS0xLjA1NS0wLjA2MmMxLjk1NiwxLjI2MSw0LjI4LDEuOTk3LDYuNzc1LDEuOTk3YzguMTMxLDAsMTIuNTc0LTYuNzc4LDEyLjU3NC0xMi42NTljMC0wLjE5My0wLjAwNC0wLjM4Ny0wLjAxMi0wLjU3N2MwLjg2NC0wLjYyNywxLjYxMy0xLjQxMSwyLjIwNC0yLjMwM2MtMC43OTEsMC4zNTQtMS42NDQsMC41OTMtMi41MzcsMC43MDFDMjAuMTQ2LDIuNDI0LDIwLjg0NywxLjU1MywyMS4xNzYsMC41MTRcXFwiLz5cXG5cdFx0XHRcdFx0XHQ8L2E+XFxuXHRcdFx0XHRcdDwvbGk+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz0nZmFjZWJvb2snPlxcblx0XHRcdFx0XHRcdDxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZmFjZWJvb2tVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmZhY2Vib29rVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJmYWNlYm9va1VybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDE4IDE4XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxOCAxOFxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCIgZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTE3LjcxOSwxNi43NTZjMCwwLjUzMS0wLjQzMSwwLjk2My0wLjk2MiwwLjk2M2gtNC40NDN2LTYuNzUzaDIuMjY3bDAuMzM4LTIuNjMxaC0yLjYwNFY2LjY1NGMwLTAuNzYyLDAuMjExLTEuMjgxLDEuMzA0LTEuMjgxbDEuMzk0LDBWMy4wMTljLTAuMjQxLTAuMDMyLTEuMDY4LTAuMTA0LTIuMDMxLTAuMTA0Yy0yLjAwOSwwLTMuMzg1LDEuMjI3LTMuMzg1LDMuNDc5djEuOTQxSDcuMzIydjIuNjMxaDIuMjcydjYuNzUzSDEuMjQzYy0wLjUzMSwwLTAuOTYyLTAuNDMyLTAuOTYyLTAuOTYzVjEuMjQzYzAtMC41MzEsMC40MzEtMC45NjIsMC45NjItMC45NjJoMTUuNTE0YzAuNTMxLDAsMC45NjIsMC40MzEsMC45NjIsMC45NjJWMTYuNzU2XFxcIi8+XFxuXHRcdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0PC91bD5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9mb290ZXI+XFxuXFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0XHRcdDxkaXY+PC9kaXY+XFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGJ1ZmZlciA9IFwiXCI7XG5cbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ob3Jpem9udGFsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ob3Jpem9udGFsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwiaG9yaXpvbnRhbFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5ob3Jpem9udGFsKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbn0sXCI0XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0XHRcdFx0XHQ8ZGl2PjwvZGl2PlxcblwiO1xufSxcIjZcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcIlwiO1xuXG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudmVydGljYWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZlcnRpY2FsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwidmVydGljYWxcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMudmVydGljYWwpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgYWxpYXM0PWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLCBidWZmZXIgPSBcbiAgXCI8ZGl2IGNsYXNzPSdwYWdlLXdyYXBwZXIgaG9tZS1wYWdlJz5cXG5cdDxkaXYgY2xhc3M9XFxcImJnLXdyYXBwZXJcXFwiPlxcblx0XHQ8aW1nIHNyYz0nXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJndXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5iZ3VybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiYmd1cmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJz5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiZ3JpZC1jb250YWluZXJcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmdyaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmdyaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwob3B0aW9ucz17XCJuYW1lXCI6XCJncmlkXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmdyaWQpIHsgc3RhY2sxID0gYWxpYXM0LmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImxpbmVzLWdyaWQtY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiaG9yaXpvbnRhbC1saW5lc1xcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2xpbmVzLWdyaWQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2xpbmVzLWdyaWQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImxpbmVzLWdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnNbJ2xpbmVzLWdyaWQnXSkgeyBzdGFjazEgPSBhbGlhczQuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInZlcnRpY2FsLWxpbmVzXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbGluZXMtZ3JpZCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbGluZXMtZ3JpZCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwibGluZXMtZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVyc1snbGluZXMtZ3JpZCddKSB7IHN0YWNrMSA9IGFsaWFzNC5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIlx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYm90dG9tLXRleHRzLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnQtdGV4dFxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiZnJvbnQtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHRcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudGV4dF9hIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50ZXh0X2EgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInRleHRfYVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIj48L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0LXRleHRcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImZyb250LXdyYXBwZXJcXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwidmlzaW9uXFxcIj5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYV92aXNpb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFfdmlzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJhX3Zpc2lvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcImxvZ29cXFwiPlxcblx0XHRcdFx0XHQ8aW1nIHNyYz1cXFwiaW1hZ2UvbG9nby1tYWxsb3JjYS5wbmdcXFwiPlxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJhcm91bmQtYm9yZGVyLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRvcFxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImJvdHRvbVxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnRcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+PC9kaXY+XFxuXFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnQtc3RlcC10b3BcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsZWZ0LXN0ZXAtYm90dG9tXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHQtc3RlcC10b3BcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodC1zdGVwLWJvdHRvbVxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImFyb3VuZC1ib3JkZXItbGV0dGVycy1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ0b3BcXFwiPlxcblx0XHRcdDxkaXY+YTwvZGl2Plxcblx0XHRcdDxkaXY+YjwvZGl2Plxcblx0XHRcdDxkaXY+YzwvZGl2Plxcblx0XHRcdDxkaXY+ZDwvZGl2Plxcblx0XHRcdDxkaXY+ZTwvZGl2Plxcblx0XHRcdDxkaXY+ZjwvZGl2Plxcblx0XHRcdDxkaXY+ZzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYm90dG9tXFxcIj5cXG5cdFx0XHQ8ZGl2PmM8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmU8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnRcXFwiPlxcblx0XHRcdDxkaXY+MTwvZGl2Plxcblx0XHRcdDxkaXY+MjwvZGl2Plxcblx0XHRcdDxkaXY+MzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHRcXFwiPlxcblx0XHRcdDxkaXY+MTwvZGl2Plxcblx0XHRcdDxkaXY+MjwvZGl2Plxcblx0XHRcdDxkaXY+MzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdC1zdGVwLXRvcFxcXCI+XFxuXHRcdFx0PGRpdj5hPC9kaXY+XFxuXHRcdFx0PGRpdj5iPC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsZWZ0LXN0ZXAtYm90dG9tXFxcIj5cXG5cdFx0XHQ8ZGl2PjQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0LXN0ZXAtdG9wXFxcIj5cXG5cdFx0XHQ8ZGl2PmY8L2Rpdj5cXG5cdFx0XHQ8ZGl2Pmc8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0LXN0ZXAtYm90dG9tXFxcIj5cXG5cdFx0XHQ8ZGl2PjQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcIm1hcC13cmFwcGVyXFxcIj5cXG5cdFx0XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRpdGxlcy13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJkZWlhXFxcIj5ERUlBPC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiZXMtdHJlbmNcXFwiPkVTIFRSRU5DPC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiYXJlbGx1ZlxcXCI+QVJFTExVRjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDY5MyA2NDVcXFwiPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJtYXAtYmdcXFwiIGZpbGw9XFxcIiMxRUVBNzlcXFwiIGQ9XFxcIk05LjI2OCwyODkuMzk0bDkuNzktNy43OThsMS44OTEsMC43OTNsLTEuNjI5LDUuMDIxbC01LjI4Niw0LjUwNGwtNC4zNTQsNy4wMTJsLTMuMDg4LTEuMTk4bC0yLjIzNCwyLjg4NWwwLDBsLTIuMzgyLTEuMTc3TDkuMjY4LDI4OS4zOTR6IE01NzMuNTgsMTc0LjIxMWwxOS44OS0xMy44Mmw4LjkwMS0yLjQ3OWw1LjM1NC00LjgwOWwxLjU2LTUuNTU1bC0xLTYuOTIybDEuNDQ1LTMuOTczbDUuMDU3LTIuNTIzbDQuMjcxLDIuMDFsMTEuOTA2LDkuMTY1bDIuNjkzLDQuOTE3bDIuODkyLDEuNTc1bDExLjQ4MiwxLjM2N2wzLjA1NywxLjk0OWw0LjQxOCw1LjIxMWw3Ljc2OCwyLjIyMWw1LjgzMiw0LjkxNmw2LjMwNSwwLjIxNWw2LjM3My0xLjIybDEuOTg5LDEuODhsMC40MDksMS45NjNsLTUuMzM2LDEwLjQyOGwtMC4yMjksMy44NjlsMS40NDEsMS42NDdsMC44NTQsMC45NThsNy4zOTUtMC40MjdsMi4zNDcsMS41NGwwLjkwMywyLjUxOWwtMi4xMDIsMy4wNTRsLTguNDI1LDMuMTgzbC0yLjE2OSw3LjExNmwwLjM0NCwzLjE4M2wzLjA3Myw0LjIzMWwwLjAxNSwyLjg0NmwtMi4wMTksMS40NWwtMC43MzksMy44NDNsMi4xNjYsMTYuNjg3bC0wLjk4MiwxLjg4bC02Ljc4NS0zLjc1N2wtMS43NTgsMC4yNTRsLTIuMDE5LDQuNDY4bDEuMDMyLDYuMjM3bC0wLjYwNSw0LjgyN2wtMC4zNjMsMi44NjhsLTEuNDk1LDEuNjY1bC0yLjEwMi0wLjEyOWwtOC4zNDEtMy44NDdsLTQuMDExLTAuNDA1bC0yLjcxMSwxLjYwNGwtNy40MzgsMTYuNDk3bC0zLjI4NCwxMS41OTlsMy4yMiwxMC41OTdsMS42NCwxLjg1OWw0LjM4Ni0wLjI4bDEuNDc4LDEuNjlsLTEuOTM3LDMuMzk1bC0yLjY5MywxLjA5NWwtNy44NTEtMC4xMjlsLTIuNTQ2LDEuNjIybC0yLjY2MSwzLjcxOGwwLjEyOSwwLjg5N2wwLjYwOSw0LjQ0NmwtMS40NzgsNC4zMTNsLTMuNjgsMy4zMTJsLTMuOTA5LDEuMTczbC0xMS45ODksNy43NThsLTUuMzU0LDcuOTY3bC04LjkzOCw2LjUzOWwtMy4zNTEsNi42NjNsLTUuNzgsNi41NDJsLTQuODI3LDguMTgybDAuMjk0LDMuOTA4bC00Ljg5NiwxMi4yODdsLTIuMDIsNS4xMDdsLTMuMjAyLDIyLjM5M2wwLjcyMSw4Ljg0MmwtMS4wMzMsMi45NWwtMS43MjUtMC4yNzZsLTQuMTI1LTQuNDY4bC0xLjYyNCwwLjk2MmwtMS4zOTYsMy4yNzJsMS44MjIsNC44NDhsLTEuNjkyLDUuMDIxbC00LjczMSw2LjYwNGwtOC4wNjIsMTkuMjkybC0yLjk3NywwLjM0MWwtMC41NDEsMC40NDhsLTEuNDc5LDEuMTk1bDEuMzE2LDQuNDg5bC0yLjI4NCwzLjM5NWwtMi41MTQsMS4yNjRsLTUuNDg0LTQuNTMybC0zLjA4OC0wLjg5NGwtMC44MDcsMS45MDFsMi4yMjEsNy4xNzhsLTMuNCwxLjM4OWwtOC4zNjMtMC4xM2wtMS41MTEsMi4ybDEuMTAyLDUuMzY1bC0wLjY4OCwyLjc3M2wtMy4xMzgsMy4xNjVsLTYuNjAzLDIuOGwtMy44OTYsNC4xODhsLTQuNjI5LTEuMzI0bC00LjczMSwwLjYxN2wtNS4wOTItMi41ODRsLTIuNjI1LDMuNTY3bDAuNDczLDIuNzEzbDAuMTgsMS4wMjZsLTEuMzEyLDEuNjg3bC0xMi40NTIsNC43NjZsLTQuNTk4LDQuNDg1bC03LjA2MiwxMS4wNjdsLTE3LjYyMywxOS44MDlsLTQuMDkyLDEuNzI3bC00LjQ5OC0wLjYxN2wtMy42NDYtMy4xODRsLTIuNzk1LTYuNTE3bC03LjE3Ni04Ljg2N2wtMS4yMzMtMC41NTZsLTMuNTE1LTEuNjQ0bC0xLjkwNC0zLjYzMmwxLjM0OS01LjM4N2wtMy4yNzEtNC4wNTlsLTcuMDE1LTUuNTEybC0yLjg5MSwxLjc5NGwtNC4wMjMsMC40N2wtMi44NzMtMS43MjlsLTEuMjY3LTUuNTU1bDQuNzk5LTguMzU0bC0wLjA4Mi0xLjYwMWwtMi41MjgtNC44OTVsLTguMDItOS42MTRsLTUuMzUyLTQuMTY2bC00LjYxNS0xLjgzN2wtNC4yMjEsMC42NDJsLTYuNzg1LTAuNzcxbC00LjgxMy0wLjU3NGwtNi45NDYsMi42MjdsLTMuMDA2LDQuMDU5bC0xLjkyMiwwLjI1NWwtMTQuNTY4LTcuODM3bC00Ljg2Mi0wLjYyMWwtOC40NiwxLjgzN2wtOC40ODktMC45ODNsLTQuMjA3LDAuNjY0bC03LjcxOCw0LjE2N2wtMy41MTUsMC42ODJsLTIuOTA4LTEuMTk1bC00LjgxMi00LjY4M2wtNC4xNTctMC41NTNsLTcuMjczLDEuNDMybC0xLjY0Mi0wLjY4MmwtMS4zNjMtNC4xMjdsLTQuODk4LTMuMDc1bC0zLjE5OS01LjI3OWwtMTEuNDAxLTguODg1bC01LjIyMi03LjE1OWwtMy4wODgtNy41NjVsLTAuNDA5LTUuODMxbDMuNjExLTEyLjY3MWwwLjEzMy01LjgxMWwtMS4xNjktNC40NjhsLTUuODQ2LTguNDE4bC0zLjAzNy02LjQ0OWwtMi4zMTctNC45MzhsMS4zNjMtMi43NTNsMy43NzUtMi4wOTZsMi45OTItNy40MTRsNC40LTMuOTk0bDIuMTA0LTMuNzYxbC00LjAyNC05LjkxNWwtMy44NDQtNi43MjlsLTguMzQ2LTcuNjQ3bC04Ljc2OS0yLjU4OGwtOS40MjktMTAuMzQybC00LjI1Ny0yLjMyNWwtNS4zMTgtNS4zODZsLTcuMjYyLTEuOTQ1bC0wLjY3MS0wLjE2OGwtNS4xNzUtMS4zOTNsLTIuOTU2LDAuNTZsLTIuODU3LDAuNTUzbC0yLjkyNC0xLjA0OGwtMy45NDQsMi4wOTZsLTIuMyw0LjEyM2wwLjE0NywxLjQzMmwwLjA4NywwLjY4MmwzLjkzOCw1LjE0OWwtMi4zOTYsMi41MjNsLTEwLjg4OC01LjY4NWwtNC4yMDcsMC4xNTFsLTUuOTkzLDExLjY2M2wtNC4wOTIsMy44MjlsLTYuNzE3LTAuODMzbC05LjkyMSwzLjI2NmwtNy42NTIsMi41MjJsLTIuNzc2LDMuMDMzbC0wLjI5NywyLjQ1NGwzLjMwMyw0LjA0MWwtMy4wMjMsMS4wOTFsLTAuNTkyLDEuMzY3djcuMDQ4bC02Ljg4MiwxNS43MDRsLTIuNzc2LDEwLjI1NmwxLjIwMiw0LjEwMmwtMC44MjUsMi42MDlsLTEyLjMxNS01LjE5M2wtOC43NTgtNi40MzFsLTUuMDQzLDIuOTA3bC0wLjg4NiwwLjQ4OGwxLjQ4MS01LjIxMWwtMS42MS02LjQwOWwyLjAyLTUuNTU2bC0wLjkxOS0yLjY3bC00LjQzNiwxLjM2N2wtNC42ODEtMC42bC0zLjA3My00LjkxMmwtMS4zNDUtNC42MzdsMS4xOC0yLjk0OWwyLjg5NS0xLjk2N2w3LjAxMS0wLjcwM2wxLjY0My0xLjMyOGwtMC4yNjItMS43N2wtNy4zNDUtMy41NDlsLTYuNDctMTAuMzYzbC02LjEyNiwwLjA0M2wtNC41OTgsNS4wNjZsLTMuNTY0LDAuODczbC00Ljc0OCwxLjE3NmwtMC41OTItMi4xMzVsMS4wNTEtMy44MjVsLTEuMDgzLTIuODY0bC0zLjI4NS0wLjcwNkw2NC4zNzUsMzI4bC0yLjU5Nyw2Ljc1M2wtNC42OTgsMy4yOTFsLTQuODU5LTAuNTc3bDAuNzA3LTMuODQ4bC0xLjEwMi0yLjM1MWwtMy4xNywwLjM4NGwtMy4xNzEtMy4xNThsLTQuMDQxLDQuMzc5bC0zLjE1MiwwLjIxMWwtMS42NDQtMi4zNjhsMi42MTEtMy4yMjlsOC41NDMtMy40NTlsMy40NDYtMi44MTdsLTAuMTE1LTEuMjQybC0xLTAuNzVsLTIuNjkzLDEuMjYzbC01LjM4Ny0wLjQzMWwtMi4xODUtMi4yMzlsLTEwLjY0NC0xMC44OThsLTAuNTkyLTIuMTM1bDEuNzA3LTYuNjAzbC0wLjU3NC0yLjQ5OGwtMy41MjktMi45OTNsLTAuNjA5LTIuMTU3bDMuNjk0LTcuNzM3bDIuMzAyLTAuNTk2bDIuNzEyLTUuNTE2bDkuMTgxLTkuNDJsOC41NzEsMC4wNjVsMTEuNjI3LTUuNTk5bDUuODM1LTQuOTk5bDEuODU0LTIuNzc4bDMuMjM1LTQuODk1bDUuODMxLTQuNjU0bDEyLjg5My02LjQxM2w3LjEzLTYuMzQ1bDUuMDg5LTcuMzA2bDUuNzE3LTIuMzcybDUuODMxLTguMzMzbDMuMjg1LTIuODQybDcuNDg4LTIuOTcxbDQuODYzLTYuMDg2bDMuMjAzLTEuMjYzbDEwLjE2NywxLjM2N2w2LjY3MS0xLjc1MWw1LjA1Ny0zLjQzOGwxNC45OC0xMi4yODdsNC4wODgtOC4yNDdsMTQuMDQ0LTE0LjYxNmw2LjY2Ny0xMC43NDRsNC4wMSwzLjkxMmw0LjQ4My0xLjkwMmw1LjMwOC00LjQ4NmwxLjc5LTQuMjEzbDYuMTU3LTE0LjQwMWw0LjgyNy0xLjg1NWw2LjQwOCw0LjkxM2wyLjU5NC0yLjg2NGwtMC43MzgtNS44NTNsMC42NzQtMi45NjhsMjEuOTYzLTE3Ljg4NWw1LjAzOS0yLjczNGw1Ljc5OSwzLjMxMmwzLjM2Ny0wLjg3NWwzLjUzMy0zLjY5NmwxLjgwOC01LjI1N2wwLjQ1OS0xLjMyNGwzLjI5OSwwLjcwN2wxLjQxNC0xMC40OTNsMS44MjEtMS4zMjRsNC42NjYsMS4zMDNsNC40NjUtMS4zNDZsNi41NTYsMi4xMTNsLTAuMTk3LTIuMDQ5bC0wLjExNC0xLjIzOGwtMC4wMzItMC4yNThsMS43MDctMi41NDFsMC40NDQsMC4wNjRsOS44MTksMS41MThoMC4wMThsNi44MTctMi4yOWw1Ljg2LTEuOTYzbDcuMDk4LTguMjVsOC4zNi0yLjJsNC41MzItMi43NTlsNC41MDEtNS43NjdsMi40ODEtMy4xODNsOC4xNjMtNS4yMWw0Ljk5MiwyLjAyN2w0LjQxOC0zLjk3Mmw0LjA1Ny0wLjQ5Nmw0LjkxMy0yLjkwM2w4LjQ3NS0xMC44MDlsMi43NzUsMC42ODJsMy4zODMsMy42MWwxLjg5LDIuMDMxbDIuMzYzLDIuNTE5bDguNjQzLTAuNzY4bDE1LjYwMi0xMi4zNDhsNC44MTItMi40NThsMTEuMDcxLTUuNjYzbDMuNzEyLTAuMTQ3bC0wLjQ3OCw1LjQ0N2wxLjg5MSwwLjc5bDUuNzY3LTIuNjY5bDMuNjExLDEuMjU5bC0yLjcyNiw0Ljk1NmwwLjE0NywzLjUyN2wzLjcxMi0wLjMyM2wxNy42NzMtMTEuNTEybDIuMzE3LTAuNTc4bDIuMDA1LDEuNjg3bC0wLjk4NiwyLjA3NGwwLjQwOCwxLjk2NmwxMS4zNTItMS44NDFsNC4zNTQtMi41ODRsMS43MDctMi4zNzJsNC4zODMtNi4wODZsNy4xNDctNS4yMzZsMTIuNDM0LTUuNDczbDQuNTY1LTAuMDg2bDAuOTY5LDEuNDUzbC0xLjcwNywyLjM3NmwwLjc3MSwxLjk4NGw0LjA1Ni0wLjI5OGwxMy44NDctNS43MjhsMi4yMzQsMS4wMDVsLTQuMDg5LDMuOTk0bC0yLjMzNCw2LjkwMWwtMi4xODUsMS40NzVsLTMuNDgyLTAuNTU2bC0zLjIyMSwxLjA0NGwtOC45MTYsNi44NjFsLTYuNjg0LDUuMTI4bC0zLjc4MSwxLjczbC0xMS4zOTYtMC4yOThsLTUuOTQ2LDUuNjYzbC0zLjI1Myw0Ljc0NGwtNC4yNTQsMS4wMDVsLTAuMTc5LDkuMzEybC03LjYyMS04LjE4MmwtNC43NDksMC4yNzZsLTMuNzQzLDQuMTkxbC0xLjIzNCw2LjQ0OWwxLjc0Myw5LjYxN2wyLjgwOCw2LjQ5MmwxLjg3Miw0LjMzOWw3LjA0OCw1LjY4MWw5LjM3OC0xLjIzOGw3LjExMi01LjA2M2wyLjI5OS0wLjIzM2wyLjg3NiwxLjkybDIuOTg3LTAuMTY4bDMuODc3LTMuMzA5bDkuMjk2LTIuOTkzbDQuOTA5LTMuMjQ4bDUuODUtNy4yNDJsMy4xMDMtMi4xMTdsNC4wNi0wLjEyOWwzLjM5OSwxLjk2N2wtOS42MjUsOC43ODFsLTAuMzEyLDAuOTgzbC0xLjgyNSw1Ljc2N2wwLjg4OSwzLjA1OGwyLjMxNywyLjQxMWwzLjAwNi0wLjM2MmwwLjM0NCwzLjIwOGwtNC4wNTYsMy40NTlsLTYuNTA2LDkuNTFsLTQuMDA3LDIuNzUybC03LjcwMy0wLjI1NWwtNi42ODUsMy41MDZsLTMuMzA0LTAuNTZsLTIuNDYzLTMuMTE4bC0zLjM4My0yLjEzNWwtMS45MzksMC4yNTRsLTIuOTU2LDIuNjQ4bC0yLjIzMyw1LjM0NGwtMS45NTUsNi45MjJsMC41NDUsMi42OTFsMCwwbDMuODQyLDEzLjA3N2w4LjA0OCwxNS45NjJsNi40MzgsNy4yMmwxMy4zMjMsOS40MDJsMjIuNTQ4LDEwLjI1M2wwLjYyNywxLjI2M2wxMS41NDUsNS42Mmw1LjM0LDIuNTgzbDUuMTc1LDEuNTM2bDMuODc0LTAuNDg4bDUuNDU0LTMuMzc2TDU3My41OCwxNzQuMjExeiBNMzg3LjUxNyw2MDEuOTczbC0yLjc1OS0zLjY5NmwwLjQ1OS0xLjkwMmwyLjEzOC0xLjEzbDAuMzI3LTIuOTc1bDIuNTE0LTEuNDVsMy44MDksMC41NTZsMC40MjcsMS42MjJsLTIuMjgsNy4wOTVsLTIuMDU2LDIuNTQxbDAsMEwzODcuNTE3LDYwMS45NzN6IE0zNjUuNjU3LDYxNC4zNDZsMy45MDksMTEuNDkxbDIuMjE3LDAuNjYzbDAuOTgyLTIuMDdsLTAuMjQ0LTAuNzcxbC0xLjA4My0zLjUyM2wwLjYzOC0yLjQzOGwyLjU5OCwwLjMwMmwyLjc4OSwzLjE1OGwzLjA5MywwLjcwN2wyLjI0OC0zLjA1OGwtMS45OS01LjIxMWwwLjY2LTIuNDM3bDIuNjI1LTAuMzg0bDQuNzE2LDIuODg1bDYuMDExLDEuMjE3bDIuMzM1LDEuOTAybC00LjYzNCw1LjU1NWwtNC4xNzEtMC4yMzZsLTEuNDc4LDEuODU4bC0wLjg0LDIuNjA4bDIuNDY1LDIuNjA1bC0zLjIwMyw0Ljc2NmwwLjA4MywxLjc3M2wzLjUyOCw1LjQ2OWwtMC41ODgsMS4yMmwtMi40NDksMC4zODRsLTUuOTkzLTEuNzUxbC02LjE5MywxLjk2M2wwLDBsLTAuMjgtNC40MjVsLTguNTM5LDAuNDA5bC0wLjQ0NC0xLjQzMmwzLjM4Ni00Ljc0NGwtMC43ODktMS42MjJsLTYuODUtMS43OTRsLTAuNjI1LTQuNjE1bDQuOTYtNS4wMjFsLTIuNTE0LTEuOTAxbC0wLjQwOS0yLjEzNmwxLjQ5Mi0yLjAzMUwzNjUuNjU3LDYxNC4zNDZ6XFxcIi8+XFxuXHRcdFx0PHBhdGggaWQ9XFxcIm91dGVyLWJvcmRlclxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjRkZGRkZGXFxcIiBzdHJva2Utd2lkdGg9XFxcIjJcXFwiIGQ9XFxcIk0xOS4wNTgsMjgxLjU5NmwxLjg5MSwwLjc5M2wtMS42MjksNS4wMjFsLTUuMjg2LDQuNTA0bC00LjM1NCw3LjAxMmwtMy4wODgtMS4xOThsLTIuMjM0LDIuODg1bC0yLjM4Mi0xLjE3N2w3LjI5Mi0xMC4wNDFMMTkuMDU4LDI4MS41OTZ6IE02ODkuNDU1LDE5My44ODhsMi4xMDItMy4wNTRsLTAuOTAzLTIuNTE5bC0yLjM0Ny0xLjU0bC03LjM5NSwwLjQyN2wtMC44NTQtMC45NThsLTEuNDQxLTEuNjQ3bDAuMjI5LTMuODY5bDUuMzM2LTEwLjQyOGwtMC40MDktMS45NjNsLTEuOTg5LTEuODhsLTYuMzczLDEuMjJsLTYuMzA1LTAuMjE1bC01LjgzMi00LjkxNmwtNy43NjgtMi4yMjFsLTQuNDE4LTUuMjExbC0zLjA1Ny0xLjk0OWwtMTEuNDgyLTEuMzY3bC0yLjg5Mi0xLjU3NWwtMi42OTMtNC45MTdsLTExLjkwNi05LjE2NWwtNC4yNzEtMi4wMWwtNS4wNTcsMi41MjNsLTEuNDQ1LDMuOTczbDEsNi45MjJsLTEuNTYsNS41NTVsLTUuMzU0LDQuODA5bC04LjkwMSwyLjQ3OWwtMTkuODksMTMuODJsLTYuMzA5LDAuMTcybC01LjQ1NCwzLjM3NmwtMy44NzQsMC40ODhsLTUuMTc1LTEuNTM2bC01LjM0LTIuNTgzbC0xMS41NDUtNS42MmwtMC42MjctMS4yNjNsLTIyLjU0OC0xMC4yNTNsLTEzLjMyMy05LjQwMmwtNi40MzgtNy4yMmwtOC4wNDgtMTUuOTYybC0zLjg0Mi0xMy4wNzdsLTAuNTQ1LTIuNjkxbDEuOTU1LTYuOTIybDIuMjMzLTUuMzQ0bDIuOTU2LTIuNjQ4bDEuOTM5LTAuMjU0bDMuMzgzLDIuMTM1bDIuNDYzLDMuMTE4bDMuMzA0LDAuNTZsNi42ODUtMy41MDZsNy43MDMsMC4yNTVsNC4wMDctMi43NTJsNi41MDYtOS41MWw0LjA1Ni0zLjQ1OWwtMC4zNDQtMy4yMDhsLTMuMDA2LDAuMzYybC0yLjMxNy0yLjQxMWwtMC44ODktMy4wNThsMS44MjUtNS43NjdsMC4zMTItMC45ODNsOS42MjUtOC43ODFsLTMuMzk5LTEuOTY3bC00LjA2LDAuMTI5bC0zLjEwMywyLjExN2wtNS44NSw3LjI0MmwtNC45MDksMy4yNDhsLTkuMjk2LDIuOTkzbC0zLjg3NywzLjMwOWwtMi45ODcsMC4xNjhsLTIuODc2LTEuOTJsLTIuMjk5LDAuMjMzbC03LjExMiw1LjA2M2wtOS4zNzgsMS4yMzhsLTcuMDQ4LTUuNjgxbC0xLjg3Mi00LjMzOWwtMi44MDgtNi40OTJsLTEuNzQzLTkuNjE3bDEuMjM0LTYuNDQ5bDMuNzQzLTQuMTkxbDQuNzQ5LTAuMjc2bDcuNjIxLDguMTgybDAuMTc5LTkuMzEybDQuMjU0LTEuMDA1bDMuMjUzLTQuNzQ0bDUuOTQ2LTUuNjYzbDExLjM5NiwwLjI5OGwzLjc4MS0xLjczbDYuNjg0LTUuMTI4bDguOTE2LTYuODYxbDMuMjIxLTEuMDQ0bDMuNDgyLDAuNTU2bDIuMTg1LTEuNDc1bDIuMzM0LTYuOTAxbDQuMDg5LTMuOTk0bC0yLjIzNC0xLjAwNWwtMTMuODQ3LDUuNzI4bC00LjA1NiwwLjI5OGwtMC43NzEtMS45ODRsMS43MDctMi4zNzZsLTAuOTY5LTEuNDUzbC00LjU2NSwwLjA4NmwtMTIuNDM0LDUuNDczbC03LjE0Nyw1LjIzNmwtNC4zODMsNi4wODZsLTEuNzA3LDIuMzcybC00LjM1NCwyLjU4NGwtMTEuMzUyLDEuODQxbC0wLjQwOC0xLjk2NmwwLjk4Ni0yLjA3NGwtMi4wMDUtMS42ODdsLTIuMzE3LDAuNTc4bC0xNy42NzMsMTEuNTEybC0zLjcxMiwwLjMyM2wtMC4xNDctMy41MjdsMi43MjYtNC45NTZsLTMuNjExLTEuMjU5bC01Ljc2NywyLjY2OWwtMS44OTEtMC43OWwwLjQ3OC01LjQ0N2wtMy43MTIsMC4xNDdsLTExLjA3MSw1LjY2M2wtNC44MTIsMi40NThsLTE1LjYwMiwxMi4zNDhsLTguNjQzLDAuNzY4bC0yLjM2My0yLjUxOWwtMS44OS0yLjAzMWwtMy4zODMtMy42MWwtMi43NzUtMC42ODJsLTguNDc1LDEwLjgwOWwtNC45MTMsMi45MDNsLTQuMDU3LDAuNDk2bC00LjQxOCwzLjk3MmwtNC45OTItMi4wMjdsLTguMTYzLDUuMjFsLTIuNDgxLDMuMTgzbC00LjUwMSw1Ljc2N2wtNC41MzIsMi43NTlsLTguMzYsMi4ybC03LjA5OCw4LjI1bC01Ljg2LDEuOTYzbC02LjgxNywyLjI5aC0wLjAxOGwtOS44MTktMS41MThsLTAuNDQ0LTAuMDY0bC0xLjcwNywyLjU0MWwwLjAzMiwwLjI1OGwwLjExNCwxLjIzOGwwLjE5NywyLjA0OWwtNi41NTYtMi4xMTNsLTQuNDY1LDEuMzQ2bC00LjY2Ni0xLjMwM2wtMS44MjEsMS4zMjRsLTEuNDE0LDEwLjQ5M2wtMy4yOTktMC43MDdsLTAuNDU5LDEuMzI0bC0xLjgwOCw1LjI1N2wtMy41MzMsMy42OTZsLTMuMzY3LDAuODc1bC01Ljc5OS0zLjMxMmwtNS4wMzksMi43MzRsLTIxLjk2MywxNy44ODVsLTAuNjc0LDIuOTY4bDAuNzM4LDUuODUzbC0yLjU5NCwyLjg2NGwtNi40MDgtNC45MTNsLTQuODI3LDEuODU1bC02LjE1NywxNC40MDFsLTEuNzksNC4yMTNsLTUuMzA4LDQuNDg2bC00LjQ4MywxLjkwMmwtNC4wMS0zLjkxMmwtNi42NjcsMTAuNzQ0bC0xNC4wNDQsMTQuNjE2bC00LjA4OCw4LjI0N2wtMTQuOTgsMTIuMjg3bC01LjA1NywzLjQzOGwtNi42NzEsMS43NTFsLTEwLjE2Ny0xLjM2N2wtMy4yMDMsMS4yNjNsLTQuODYzLDYuMDg2bC03LjQ4OCwyLjk3MWwtMy4yODUsMi44NDJsLTUuODMxLDguMzMzbC01LjcxNywyLjM3MmwtNS4wODksNy4zMDZsLTcuMTMsNi4zNDVMODAuNDcxLDI0NC40bC01LjgzMSw0LjY1NGwtMy4yMzUsNC44OTVsLTEuODU0LDIuNzc4bC01LjgzNSw0Ljk5OWwtMTEuNjI3LDUuNTk5bC04LjU3MS0wLjA2NWwtOS4xODEsOS40MmwtMi43MTIsNS41MTZsLTIuMzAyLDAuNTk2bC0zLjY5NCw3LjczN2wwLjYwOSwyLjE1N2wzLjUyOSwyLjk5M2wwLjU3NCwyLjQ5OGwtMS43MDcsNi42MDNsMC41OTIsMi4xMzVsMTAuNjQ0LDEwLjg5OGwyLjE4NSwyLjIzOWw1LjM4NywwLjQzMWwyLjY5My0xLjI2M2wxLDAuNzVsMC4xMTUsMS4yNDJsLTMuNDQ2LDIuODE3bC04LjU0MywzLjQ1OWwtMi42MTEsMy4yMjlsMS42NDQsMi4zNjhsMy4xNTItMC4yMTFsNC4wNDEtNC4zNzlsMy4xNzEsMy4xNThsMy4xNy0wLjM4NGwxLjEwMiwyLjM1MWwtMC43MDcsMy44NDhsNC44NTksMC41NzdsNC42OTgtMy4yOTFMNjQuMzc1LDMyOGwyLjg0MS0wLjkxOWwzLjI4NSwwLjcwNmwxLjA4MywyLjg2NGwtMS4wNTEsMy44MjVsMC41OTIsMi4xMzVsNC43NDgtMS4xNzZsMy41NjQtMC44NzNsNC41OTgtNS4wNjZsNi4xMjYtMC4wNDNsNi40NywxMC4zNjNsNy4zNDUsMy41NDlsMC4yNjIsMS43N2wtMS42NDMsMS4zMjhsLTcuMDExLDAuNzAzbC0yLjg5NSwxLjk2N2wtMS4xOCwyLjk0OWwxLjM0NSw0LjYzN2wzLjA3Myw0LjkxMmw0LjY4MSwwLjZsNC40MzYtMS4zNjdsMC45MTksMi42N2wtMi4wMiw1LjU1NmwxLjYxLDYuNDA5bC0xLjQ4MSw1LjIxMWwwLjg4Ni0wLjQ4OGw1LjA0My0yLjkwN2w4Ljc1OCw2LjQzMWwxMi4zMTUsNS4xOTNsMC44MjUtMi42MDlsLTEuMjAyLTQuMTAybDIuNzc2LTEwLjI1Nmw2Ljg4Mi0xNS43MDR2LTcuMDQ4bDAuNTkyLTEuMzY3bDMuMDIzLTEuMDkxbC0zLjMwMy00LjA0MWwwLjI5Ny0yLjQ1NGwyLjc3Ni0zLjAzM2w3LjY1Mi0yLjUyMmw5LjkyMS0zLjI2Nmw2LjcxNywwLjgzM2w0LjA5Mi0zLjgyOWw1Ljk5My0xMS42NjNsNC4yMDctMC4xNTFsMTAuODg4LDUuNjg1bDIuMzk2LTIuNTIzbC0zLjkzOC01LjE0OWwtMC4wODctMC42ODJsLTAuMTQ3LTEuNDMybDIuMy00LjEyM2wzLjk0NC0yLjA5NmwyLjkyNCwxLjA0OGwyLjg1Ny0wLjU1M2wyLjk1Ni0wLjU2bDUuMTc1LDEuMzkzbDAuNjcxLDAuMTY4bDcuMjYyLDEuOTQ1bDUuMzE4LDUuMzg2bDQuMjU3LDIuMzI1bDkuNDI5LDEwLjM0Mmw4Ljc2OSwyLjU4OGw4LjM0Niw3LjY0N2wzLjg0NCw2LjcyOWw0LjAyNCw5LjkxNWwtMi4xMDQsMy43NjFsLTQuNCwzLjk5NGwtMi45OTIsNy40MTRsLTMuNzc1LDIuMDk2bC0xLjM2MywyLjc1M2wyLjMxNyw0LjkzOGwzLjAzNyw2LjQ0OWw1Ljg0Niw4LjQxOGwxLjE2OSw0LjQ2OGwtMC4xMzMsNS44MTFsLTMuNjExLDEyLjY3MWwwLjQwOSw1LjgzMWwzLjA4OCw3LjU2NWw1LjIyMiw3LjE1OWwxMS40MDEsOC44ODVsMy4xOTksNS4yNzlsNC44OTgsMy4wNzVsMS4zNjMsNC4xMjdsMS42NDIsMC42ODJsNy4yNzMtMS40MzJsNC4xNTcsMC41NTNsNC44MTIsNC42ODNsMi45MDgsMS4xOTVsMy41MTUtMC42ODJsNy43MTgtNC4xNjdsNC4yMDctMC42NjRsOC40ODksMC45ODNsOC40Ni0xLjgzN2w0Ljg2MiwwLjYyMWwxNC41NjgsNy44MzdsMS45MjItMC4yNTVsMy4wMDYtNC4wNTlsNi45NDYtMi42MjdsNC44MTMsMC41NzRsNi43ODUsMC43NzFsNC4yMjEtMC42NDJsNC42MTUsMS44MzdsNS4zNTIsNC4xNjZsOC4wMiw5LjYxNGwyLjUyOCw0Ljg5NWwwLjA4MiwxLjYwMWwtNC43OTksOC4zNTRsMS4yNjcsNS41NTVsMi44NzMsMS43MjlsNC4wMjMtMC40N2wyLjg5MS0xLjc5NGw3LjAxNSw1LjUxMmwzLjI3MSw0LjA1OWwtMS4zNDksNS4zODdsMS45MDQsMy42MzJsMy41MTUsMS42NDRsMS4yMzMsMC41NTZsNy4xNzYsOC44NjdsMi43OTUsNi41MTdsMy42NDYsMy4xODRsNC40OTgsMC42MTdsNC4wOTItMS43MjdsMTcuNjIzLTE5LjgwOWw3LjA2Mi0xMS4wNjdsNC41OTgtNC40ODVsMTIuNDUyLTQuNzY2bDEuMzEyLTEuNjg3bC0wLjE4LTEuMDI2bC0wLjQ3My0yLjcxM2wyLjYyNS0zLjU2N2w1LjA5MiwyLjU4NGw0LjczMS0wLjYxN2w0LjYyOSwxLjMyNGwzLjg5Ni00LjE4OGw2LjYwMy0yLjhsMy4xMzgtMy4xNjVsMC42ODgtMi43NzNsLTEuMTAyLTUuMzY1bDEuNTExLTIuMmw4LjM2MywwLjEzbDMuNC0xLjM4OWwtMi4yMjEtNy4xNzhsMC44MDctMS45MDFsMy4wODgsMC44OTRsNS40ODQsNC41MzJsMi41MTQtMS4yNjRsMi4yODQtMy4zOTVsLTEuMzE2LTQuNDg5bDEuNDc5LTEuMTk1bDAuNTQxLTAuNDQ4bDIuOTc3LTAuMzQxbDguMDYyLTE5LjI5Mmw0LjczMS02LjYwNGwxLjY5Mi01LjAyMWwtMS44MjItNC44NDhsMS4zOTYtMy4yNzJsMS42MjQtMC45NjJsNC4xMjUsNC40NjhsMS43MjUsMC4yNzZsMS4wMzMtMi45NWwtMC43MjEtOC44NDJsMy4yMDItMjIuMzkzbDIuMDItNS4xMDdsNC44OTYtMTIuMjg3bC0wLjI5NC0zLjkwOGw0LjgyNy04LjE4Mmw1Ljc4LTYuNTQybDMuMzUxLTYuNjYzbDguOTM4LTYuNTM5bDUuMzU0LTcuOTY3bDExLjk4OS03Ljc1OGwzLjkwOS0xLjE3M2wzLjY4LTMuMzEybDEuNDc4LTQuMzEzbC0wLjYwOS00LjQ0NmwtMC4xMjktMC44OTdsMi42NjEtMy43MThsMi41NDYtMS42MjJsNy44NTEsMC4xMjlsMi42OTMtMS4wOTVsMS45MzctMy4zOTVsLTEuNDc4LTEuNjlsLTQuMzg2LDAuMjhsLTEuNjQtMS44NTlsLTMuMjItMTAuNTk3bDMuMjg0LTExLjU5OWw3LjQzOC0xNi40OTdsMi43MTEtMS42MDRsNC4wMTEsMC40MDVsOC4zNDEsMy44NDdsMi4xMDIsMC4xMjlsMS40OTUtMS42NjVsMC4zNjMtMi44NjhsMC42MDUtNC44MjdsLTEuMDMyLTYuMjM3bDIuMDE5LTQuNDY4bDEuNzU4LTAuMjU0bDYuNzg1LDMuNzU3bDAuOTgyLTEuODhsLTIuMTY2LTE2LjY4N2wwLjczOS0zLjg0M2wyLjAxOS0xLjQ1bC0wLjAxNS0yLjg0NmwtMy4wNzMtNC4yMzFsLTAuMzQ0LTMuMTgzbDIuMTY5LTcuMTE2TDY4OS40NTUsMTkzLjg4OHogTTM5Mi4xNTEsNjAxLjA5MmwyLjI4LTcuMDk1bC0wLjQyNy0xLjYyMmwtMy44MDktMC41NTZsLTIuNTE0LDEuNDVsLTAuMzI3LDIuOTc1bC0yLjEzOCwxLjEzbC0wLjQ1OSwxLjkwMmwyLjc1OSwzLjY5NmwyLjU3OCwwLjY2TDM5Mi4xNTEsNjAxLjA5MnogTTM4OC44MTUsNjEzLjY2bC00LjcxNi0yLjg4NWwtMi42MjUsMC4zODRsLTAuNjYsMi40MzdsMS45OSw1LjIxMWwtMi4yNDgsMy4wNThsLTMuMDkzLTAuNzA3bC0yLjc4OS0zLjE1OGwtMi41OTgtMC4zMDJsLTAuNjM4LDIuNDM4bDEuMDgzLDMuNTIzbDAuMjQ0LDAuNzcxbC0wLjk4MiwyLjA3bC0yLjIxNy0wLjY2M2wtMy45MDktMTEuNDkxbC0yLjU4Mi0wLjY2NGwtMS40OTIsMi4wMzFsMC40MDksMi4xMzZsMi41MTQsMS45MDFsLTQuOTYsNS4wMjFsMC42MjUsNC42MTVsNi44NSwxLjc5NGwwLjc4OSwxLjYyMmwtMy4zODYsNC43NDRsMC40NDQsMS40MzJsOC41MzktMC40MDlsMC4yOCw0LjQyNWw2LjE5My0xLjk2M2w1Ljk5MywxLjc1MWwyLjQ0OS0wLjM4NGwwLjU4OC0xLjIybC0zLjUyOC01LjQ2OWwtMC4wODMtMS43NzNsMy4yMDMtNC43NjZsLTIuNDY1LTIuNjA1bDAuODQtMi42MDhsMS40NzgtMS44NThsNC4xNzEsMC4yMzZsNC42MzQtNS41NTVsLTIuMzM1LTEuOTAyTDM4OC44MTUsNjEzLjY2elxcXCIvPlxcblx0XHRcdDxnIGlkPVxcXCJtYXAtZG90c1xcXCIgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoNzguMDAwMDAwLCAxNDAuMDAwMDAwKVxcXCI+XFxuXHRcdFx0XHQ8ZyBpZD1cXFwiZGVpYVxcXCI+XFxuXHRcdFx0XHRcdDxwYXRoIGlkPVxcXCJkdWJcXFwiIGRhdGEtcGFyZW50LWlkPVxcXCJkZWlhXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk0xMzIuNSwyNmMxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMxMzAuNTY3LDI2LDEzMi41LDI2elxcXCIvPlxcblx0XHRcdFx0XHQ8cGF0aCBpZD1cXFwibWF0ZW9cXFwiIGRhdGEtcGFyZW50LWlkPVxcXCJkZWlhXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk0xNDkuNSw4YzEuOTMzLDAsMy41LTEuNTY3LDMuNS0zLjVTMTUxLjQzMywxLDE0OS41LDFjLTEuOTM0LDAtMy41LDEuNTY3LTMuNSwzLjVTMTQ3LjU2Nyw4LDE0OS41LDh6XFxcIi8+XFxuXHRcdFx0XHQ8L2c+XFxuXHRcdFx0XHQ8ZyBpZD1cXFwiZXMtdHJlbmNcXFwiPlxcblx0XHRcdFx0XHQ8cGF0aCBpZD1cXFwiaXNhbXVcXFwiIGRhdGEtcGFyZW50LWlkPVxcXCJlcy10cmVuY1xcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMzI4LjUsMzIwYzEuOTMzLDAsMy41LTEuNTY3LDMuNS0zLjVzLTEuNTY3LTMuNS0zLjUtMy41Yy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41UzMyNi41NjcsMzIwLDMyOC41LDMyMHpcXFwiLz5cXG5cdFx0XHRcdFx0PHBhdGggaWQ9XFxcImJlbHVnYVxcXCIgZGF0YS1wYXJlbnQtaWQ9XFxcImVzLXRyZW5jXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk0zNDYuNSwzNDdjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY3LTMuNSwzLjVTMzQ0LjU2NywzNDcsMzQ2LjUsMzQ3elxcXCIvPlxcblx0XHRcdFx0PC9nPlxcblx0XHRcdFx0PGcgaWQ9XFxcImFyZWxsdWZcXFwiPlxcblx0XHRcdFx0XHQ8cGF0aCBpZD1cXFwiY2FwYXNcXFwiIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk00My41LDIzM2MxLjkzMywwLDMuNS0xLjU2NiwzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjYtMy41LDMuNVM0MS41NjcsMjMzLDQzLjUsMjMzelxcXCIvPlxcblx0XHRcdFx0XHQ8cGF0aCBpZD1cXFwicGVsb3Rhc1xcXCIgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTUwLjUsMjEyYzEuOTMzLDAsMy41LTEuNTY2LDMuNS0zLjVzLTEuNTY3LTMuNS0zLjUtMy41Yy0xLjkzNCwwLTMuNSwxLjU2Ni0zLjUsMy41UzQ4LjU2NywyMTIsNTAuNSwyMTJ6XFxcIi8+XFxuXHRcdFx0XHRcdDxwYXRoIGlkPVxcXCJtYXJ0YVxcXCIgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTU3LjUsMTg2YzEuOTMzLDAsMy41LTEuNTY2LDMuNS0zLjVjMC0xLjkzMy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNUM1NCwxODQuNDM0LDU1LjU2NywxODYsNTcuNSwxODZ6XFxcIi8+XFxuXHRcdFx0XHRcdDxwYXRoIGlkPVxcXCJrb2JhcmFoXFxcIiBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMjkuNSwxOTVjMS45MzMsMCwzLjUtMS41NjYsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY2LTMuNSwzLjVTMjcuNTY3LDE5NSwyOS41LDE5NXpcXFwiLz5cXG5cdFx0XHRcdFx0PHBhdGggaWQ9XFxcImR1YlxcXCIgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTI5LjUsMTcyYzEuOTMzLDAsMy41LTEuNTY3LDMuNS0zLjVzLTEuNTY3LTMuNS0zLjUtMy41Yy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41UzI3LjU2NywxNzIsMjkuNSwxNzJ6XFxcIi8+XFxuXHRcdFx0XHRcdDxwYXRoIGlkPVxcXCJwYXJhZGlzZVxcXCIgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTQuNSwxODNjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNVM2LjQzMywxNzYsNC41LDE3NmMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMyLjU2NywxODMsNC41LDE4M3pcXFwiLz5cXG5cdFx0XHRcdDwvZz5cXG5cdFx0XHQ8L2c+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImZsZXZlc1xcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjRkZGRkZGXFxcIiBkPVxcXCJNMzA0LjUzNCwxMjIuMjgxYzAuMzM0LTAuNDQsMC41NjQtMC45NzksMS4wMzMtMS4zYzAuODUxLTEuMDk2LDEuNjMxLTIuMjQ3LDIuNTI4LTMuMzA1YzAuMzQzLTAuMzk3LDAuOTgzLTAuNzI1LDEuNDQ4LTAuMzM2YzAuMDk0LDAuMzQtMC42MjksMC42MzgtMC4xNjMsMC45OGMwLjEzMiwwLjIzMywwLjg0NSwwLjE2NywwLjM0NCwwLjMyMWMtMC40NjIsMC4xODktMC45MzMsMC40MDctMS4yNDEsMC44MTVjLTAuOTMyLDAuOTU1LTEuNDE5LDIuMjMyLTEuODAxLDMuNDg3Yy0wLjUxLDAuNDMxLDAuNTE1LDEuMTg0LDAuNjc1LDAuNDYyYzAuMTUxLTAuMzE4LDAuNzgyLTAuMDg1LDAuMzg5LDAuMjAzYy0wLjM4LDAuNDU4LTAuMzU4LDEuMTE2LDAuMTE2LDEuNDcyYzAuMjA4LDAuNDk4LTAuMzcyLDAuNzcxLTAuNzU5LDAuNTM0Yy0wLjY1NC0wLjA4MS0wLjk4NiwwLjU1Ny0xLjQ4NywwLjgxOGMtMC41OTYsMC4zNTQtMS4wNTYtMC4yNTgtMS41NjMtMC40NjZjLTAuNDAzLTAuMTUyLTAuNjkxLTAuNjg3LTAuMTI4LTAuODM1YzAuMzY4LTAuMTA2LDAuMjM0LTAuNjM0LTAuMTQ2LTAuMzg2Yy0wLjUyNiwwLjI0NS0xLjIxNSwwLjE1Mi0xLjU0MywwLjY2MmMtMC41NDMsMC4zNzgtMC41NjMtMC4zOTQtMC4zMjYtMC43MDFjMC4zNjItMC42NDYsMS4wNjItMC45NzksMS41NjctMS40OTVDMzAzLjgyNywxMjIuODk3LDMwNC4xNzMsMTIyLjU3OSwzMDQuNTM0LDEyMi4yODFMMzA0LjUzNCwxMjIuMjgxeiBNMjgzLjcwMSwxMzguOTA2YzEuMDQ0LTAuNzkyLDIuMDg3LTEuNTgzLDMuMTMxLTIuMzc1YzAuMTkyLTAuMjgyLDAuODc1LTAuNTc2LDAuOTUyLTAuMDhjMC4wNzksMC4yOSwwLjMyNSwwLjY4NCwwLjY3NywwLjUzN2MwLjEyMy0wLjIyLDAuNjY3LDAuMDM4LDAuMjg2LDAuMTI1Yy0wLjMzMywwLjE3Ny0wLjg3LDAuMzQyLTAuODQsMC44MDhjMC4wMzEsMC40MDYsMC4yMjksMC43NywwLjM3MSwxLjE0NGMtMC4yOTgsMC41MTEsMC4xMjQsMS4xMjEtMC4xNSwxLjYzOGMtMC4xNDIsMC4zODUtMC4xNDIsMC44NjQtMC40ODgsMS4xNGMtMC40MjMsMC4xMy0wLjkzOC0wLjE3LTEuMjk3LDAuMTc2Yy0wLjM5OCwwLjI1OS0wLjc5OC0wLjEyOC0xLjE4NC0wLjIxNGMtMC41MjItMC4xMzctMS4wNy0wLjExMi0xLjU5OS0wLjAzMWMtMC4zNTYtMC4yMzQtMC44MzEtMC4xMzUtMS4xMjksMC4wNWMtMC40NzctMC4xMTMtMC41MzMsMC40ODEtMC43ODIsMC43MTJjLTAuMDkzLTAuMTU4LDAuMTMxLTAuNTAzLDAuMjM4LTAuNjk3YzAuMTQ0LTAuMjQzLDAuMzY5LTAuNDIzLDAuNTM2LTAuNjQ0YzAuMTY1LTAuMzgyLDAuMzYyLTAuODI1LDAuODItMC45YzAuNDAzLTAuMjEyLDAuMjI1LTAuNzM1LDAuMS0wLjk5NUMyODMuNDM2LDEzOS4xNDQsMjgzLjYyOSwxMzkuMDc2LDI4My43MDEsMTM4LjkwNkwyODMuNzAxLDEzOC45MDZ6IE0yOTcuNTUsODMuODk2YzAuNzQ2LDAuMjc3LDEuNDkyLDAuNTU1LDIuMjM3LDAuODMyYzAuMTU5LDEuMjc5LDEuOTMyLDAuNDQ1LDIuMTYyLDEuNzI0YzAuNjEyLDAuODY3LDEuOTE5LDAuMDcxLDIuODAxLDAuNDk4YzEuMDYxLDAuMTM2LDEuNDc4LDEuMTU4LDIuMDgzLDEuODkyYzAuNjc5LDAuODk0LDEuMzYyLDEuNzg2LDEuOTY5LDIuNzMxYzEuMjM3LTAuNzAzLDEuNTQyLDAuNTY4LDIuMDk0LDEuNDI1YzEuMjI5LDAuOTE2LDIuNDgyLDEuODAyLDMuNzg4LDIuNjA1YzAuNjg1LDAuODY1LDEuMDcsMS43OCwyLjM1NCwxLjUwOWMwLjkxMy0wLjE4OSwxLjcxLTAuNjY4LDIuNjgxLTAuMTk4YzEuMDA2LTAuMTM2LDIuMDcyLTAuMzk0LDIuMTMyLTEuNTM3YzEuMTgsMC4yNzgsMi4xNTgtMC4wNjgsMi45NjQtMC45NTdjMS4xOTYtMC4yMzYsMS4zMjYtMS4zNDksMS45NDctMi4xNWMwLjQzNC0wLjIsMC45MDctMC4zMTUsMS4zNDktMC41MDUgTTMxNS42NDMsOTYuOTQ3Yy0wLjM2MywwLjk3Ny0wLjgwNiwxLjk2Mi0xLjU2NCwyLjY5OWMtMC40MzMsMC44MTEsMC4zMiwyLjIwMy0wLjkwOCwyLjUyNGMtMC43OTIsMC4yMS0xLjE3NiwwLjg1Ny0xLjMzMywxLjYxOWMtMC4wNzQsMC45MDItMS4yNTksMC43NzktMS41NDIsMS40OTVjLTAuMjQyLDAuNjMzLTAuNDg0LDEuMjY2LTAuNzI2LDEuODk4YzAuMzg5LDAuODQ1LDAuNDQ5LDEuOTYyLTAuNTY2LDIuMzU0Yy0wLjUzOSwwLjg2MS0wLjE0OCwxLjkzNy0wLjEzMiwyLjg3YzAuMjc5LDAuNzkyLDEuMjUxLDEuMTQsMS40MjEsMS45NzdjLTAuMTQ0LDAuOTg2LTEuMzkzLDEuMjQ1LTEuOCwyLjA5MWMtMC4xMDQsMC4yMTMtMC4xNDMsMC40NTQtMC4xMzcsMC42ODkgTTMwMS40NSwxMjUuMjg4Yy0xLjY3LDEuNzQ5LTMuMTk3LDMuNjI1LTQuNzk2LDUuNDM4Yy0wLjc0OCwwLjIxNC0xLjcwOCwwLjA1OS0yLjIzLDAuNzYxYy0wLjQwOSwwLjM0LTAuNzA3LDAuODUzLTEuMTk0LDEuMDczYy0wLjc1NSwwLjE5OS0xLjUxLDAuMzk4LTIuMjY1LDAuNTk3Yy0wLjYyMywxLjIzNy0xLjI2NywyLjQ3Mi0yLjA4MiwzLjU5NmMtMC4xNTgsMC4wNi0wLjMxNywwLjExOS0wLjQ3NiwwLjE3OSBNMjgxLjMxMSwxNDMuMDcyYy0wLjcxNywwLjg4NC0xLjc4NCwxLjQwNS0yLjg3NSwxLjY2Yy0wLjUzMiwwLjQwMSwwLjE1OCwxLjI1LTAuNDYzLDEuNjU1Yy0wLjY0MiwwLjg3Mi0xLjQ2NSwxLjYyNS0yLjQ1MSwyLjA4MWMtMS4xMzMsMC44MS0yLjIwNiwxLjc5MS0yLjc5LDMuMDhjLTAuMjI5LDAuMzk1LTAuNDU4LDAuNzkxLTAuNjkxLDEuMTg0IE0xNzguMDg4LDMxNi42OTRsLTAuODYxLDAuNzYxbC0wLjMzMS0wLjQybC0wLjQwMS0wLjAybC0wLjczMy0wLjQ0MWwtMS4xMTQtMC44MjhsLTAuNDAyLTAuMDIxbC0xLjE1NC0wLjA2bC0wLjc1My0wLjA1N2wtMC4zODItMC40MmwtMS4xMTUtMC44MTJsLTEuMDk3LTAuODc4bC0xLjExNS0wLjgxMWwtMi4yMDktMi4wNGwwLjg1LTEuNTEybDAuNzk0LTAuNzExbDAuOS0xLjUxMmwzLjIyMS0yLjUyN2wxLjYxNi0xLjA3MWwxLjk4NS0xLjAzNWwtMC4zMTItMC43NzFsLTEuMDk1LTEuMjI5bC0wLjc2Ny0wLjQ0MWwtMS4xMzQtMC40NzhsLTAuMzgyLTAuMzcxbC0xLjE3Mi0wLjA2MWwtMS40NDktMC44OTdsLTAuNDAxLTAuMDIxbC0wLjcxMy0wLjc5MWwtMS4xMTQtMC44NzhsLTEuMTM2LTAuNDExbC0xLjEzNS0wLjQ2MWwtMC43ODItMC40NThsLTEuNTU3LTAuMDgxbC0wLjcxNC0wLjgwOGwwLjgzLTEuMDk1bDAuMDIxLTAuNDE3bDAuMDQtMC43NTFsMC40MjItMC4zNjRsMC40MjItMC4zM2wwLjQyMi0wLjM4bC0wLjM0NS0wLjc3MWwtMC4zODItMC40MzhsLTAuNDAxLTAuMDJsLTAuNzMzLTAuNDRsLTAuNDAxLTAuMDJsLTEuMTU0LTAuMDc3bC0wLjMzMi0wLjM3bC0wLjQwMS0wLjAyMWwtMC43NzMsMC4zMTFsLTAuNDE4LTAuMDIxbC0wLjM4Mi0wLjM3MWwtMC43MTctMC40NTdsMC4wMjEtMC40bC0wLjM0Mi0xLjE3MmwtMC4yOTEtMS4xNzFsMC4wMzctMC40bDAuMDItMC4zNTFsMC4zNzEtMC4zODFsMC40MjItMC4zOGwyLjAwNS0xLjQwMmwwLjg0NC0wLjc0NGwxLjY0NS0yLjIyM2wwLjQwMSwwLjAybDEuMTU1LDAuMDZsMS4xNTQsMC4wNzdsMC4wMi0wLjQwMWwwLjAyMS0wLjM1bDEuMjMxLTEuMDkxbDAuNDAyLDAuMDJsMC40NDEtMC43ODFsMC44MTEtMC43MTFsMC40MjItMC4zNjNsMC4zOTItMC43MzFsMC40MjItMC4zOGwwLjc3Mi0wLjMxMWwwLjQwMiwwLjAybDAuNDAxLDAuMDJsMC4zODktMC4zOGwwLjAzOS0wLjc1MWwwLjQ0Mi0wLjc4MWwwLjQ1OS0wLjczbDAuMzM4LTAuMzQ4bDAuMDY3LTAuMDE2bDAuODUtMS40OTZsLTAuMzA4LTEuMTcxbC0wLjM0NS0wLjgwNWwwLjAyLTAuMzg0bDAuMDYxLTEuMTUybDAuMDU4LTAuNzY4bDAuMDQtMC43NjhsLTAuMzY1LTAuNDJsLTAuMzg1LTAuMDJsLTAuNDA1LDAuMzY0bC0wLjM4NS0wLjAybC0wLjM0NS0wLjc4OGwtMC4zODUtMC4wMmwwLjAyLTAuMzg0bC0wLjc0OS0wLjQ0bC0wLjM2NS0wLjQwNGwtMC4zODUtMC4wMmwtMC44MDcsMC4zNDRsLTAuMzQ5LTAuNDA0bC0wLjQwMS0wLjAzN2wtMC43Ny0wLjA0bC0wLjM4Ni0wLjAyMWwtMC40MDQsMC4zNjRsLTAuMzg2LTAuMDIxbC0wLjQwNCwwLjM2NGwtMC4zNjUtMC40MDRsLTAuMzg1LTAuMDM3bDAuMDItMC4zODRsLTAuMzg1LTAuMDJsLTAuMzg1LTAuMDJsLTAuMzg1LTAuMDJsMC4wMi0wLjM4NGwtMC4zODUtMC4wMjFsMC4wMi0wLjM4NGwtMC4zODUtMC4wMmwtMC4zNjQtMC40MmwwLjM4NSwwLjAzN2wtMC4zNjUtMC40MmwtMC4zNDUtMC43ODhsLTAuNzQ5LTAuNDI0bC0wLjM4Ni0wLjAybC0wLjM2NC0wLjQyMWwtMC4zNDUtMC43ODhsMC4wMi0wLjM4NGwwLjAyMS0wLjM4NGwwLjAzNi0wLjM4NGwtMC4zNjQtMC40MDRsMC4wMi0wLjM4NGwtMC4zNjQtMC40MjFsMC40MjUtMC43NDhsLTAuMzY1LTAuNDA0bDEuMTM1LDAuNDZsMS4xOTEtMC4zMjNsMC4wMjEtMC4zODRsMC44My0xLjExMWwtMS40OTktMC44NjVsMC4wNC0wLjc2OGwwLjAzNi0wLjM4NGwzLjIxNy0yLjE0M2wyLjQyNy0xLjc4MmwwLjA0LTAuNzY4bDAuNDIyLTAuMzY0bDAuNDg1LTEuOTE2bDAuMDIxLTAuMzg0bDAuNDQxLTAuNzQ4bDAuMTU3LTIuNjg3bDIuODMyLTIuMTYzbDAuMzg2LDAuMDJsMS4xNTQsMC4wNzdsMC4zODUsMC4wMmwwLjc1LDAuNDI0bDAuMzg1LDAuMDJsMS4xNzIsMC4wNzdsMC43NSwwLjQyNGwwLjM4NSwwLjAyMWwxLjU0LDAuMDk3bDAuMzg1LDAuMDJsMC4wMi0wLjM4NGwwLjAyMS0wLjM4NGwwLjEzNy0yLjMybC0wLjM0NS0wLjc4OGwxLjU3Ny0wLjMwM2wwLjM4NSwwLjAybDAuNzcsMC4wNTdsMC4zNjUsMC40MDRsMC4zNjUsMC40MDRsMS45MDQsMC41MDFsMS41NTcsMC4wODFsMC4zNjQsMC40MmwwLjc1LDAuNDI0bDAuMzg1LDAuMDJsMS41NjEtMC4zMDRsMC43NDksMC40NGwwLjM0NiwwLjc4OGwyLjk3OSwyLjA5N2wwLjc1LDAuNDRsMC43NSwwLjQyNGwxLjUyLDAuNDhsMS41MiwwLjQ2NGwxLjE3MiwwLjA3N2wxLjE5NC0wLjcwOGwxLjEzNSwwLjQ0NGwwLjc3MSwwLjA1N2wwLjg0Ny0xLjExMWwwLjc5LTAuMzQ0bDAuMzg1LDAuMDJsMC4zODUsMC4wMmwwLjM4NSwwLjAybDAuMzg2LDAuMDJsMC43NDksMC40NDFsLTEuMDM3LTEuOTk3bC0wLjcxLTEuMjA4bC0wLjM0NS0wLjc4OGwwLjgwNy0wLjM0NGwxLjU4LTAuNjcxbDAuNDA1LTAuMzY0bDEuMTkxLTAuMzIzdi0wLjAxN2wxLjk4NS0xLjAzNGwyLjAwMi0xLjAzNWwxLjU5Ny0wLjY4OGwwLjcyOSwwLjgyNWwwLjc3LDAuMDRsMi4zMSwwLjEzN2wxLjE3MiwwLjA2MWwwLjM2NSwwLjQwNGwwLjcxMywwLjgyNWwzLjA1NiwwLjk0NWwxLjEzNSwwLjQ0NGwzLjgxLDEuMDAxbDIuMzI2LDAuMTM3bDEuMTU1LDAuMDZsMC43NywwLjA0MWwxLjkyMiwwLjUwMWwwLjc3LDAuMDRsMi4yODksMC41MjFsMS4xNTUsMC4wNmwtMC4wMiwwLjM4NGwyLjMwNiwwLjUyMWwxLjU0LDAuMDk3bDAuNzktMC4zNDRsMC40MDUtMC4zNjRsMS4yMzEtMS4wOTFsMS42MTctMS4wNzFsMC44MS0wLjcxMWwwLjgxMS0wLjcyOGwwLjQyMi0wLjM2M2wwLjQwNC0wLjM2NGwyLjAyMi0xLjQzNWwwLjM4NSwwLjAybDAuODExLTAuNzI4bDAuODI2LTAuNzI4bDIuMzUxLTAuNjNsMS41NzYtMC4zMDRsMS4xMTQsMC44NDVsMC43NzEsMC4wNGwxLjUzOSwwLjA5N2wwLjM4NiwwLjAybDAuMDM2LTAuMzg0bC0wLjY4OS0xLjU5MmwtMC4xNDYtNC4yNmwwLjAyLTAuMzg0bC0wLjU3Mi0zLjUxMmwtMC41NTItMy44OTZsLTAuNTkyLTMuMTI4bDAuMDItMC4zODRsMC4wMzctMC4zODRsLTAuODc3LTUuMDY3bDAuMzg1LDAuMDIxbDEuNjU3LTEuODM5bC0wLjI4OC0xLjU3MmwtMS40MzktMmwtMS4wNzQtMS42MTJsMC45NjgtMy40MzJsMC45MDctMi4yNjNsMS4xOTEtMC4zMjNsMC44ODgtMS44NzlsMC44NTEtMS40OTVsMC44NDctMS4xMTJsMS41Ni0wLjI4N2wwLjg2Ny0xLjQ5NmwyLjMxLDAuMTIxbDAuODI3LTAuNzExbDAuNDQ1LTEuMTQ4bDAuNDYyLTEuMTMxbDAuNDA1LTAuMzY0bDAuMDItMC4zODRsMC40MjYtMC43NDhsMC40MjEtMC4zNjRsMC4wMjEtMC4zODRsMC43OS0wLjM0NGwwLjQwNS0wLjM2NGwwLjAyLTAuMzg0bDAuNDIyLTAuMzY0bDAuMzg1LDAuMDM3bDAuMzg1LDAuMDIxbDAuODMxLTEuMTEybDAuODI2LTAuNzI4bDAuNDA1LTAuMzY0bDAuNDA1LTAuMzY0bDAuNDA1LTAuMzY0bDAuODA3LTAuMzQ0bDAuNzktMC4zNDRsMC43NywwLjA1N2wwLjc5LTAuMzQ0bDAuNzUsMC40MjRsMC4zODUsMC4wMmwwLjc4NywwLjA0bDAuMzg1LDAuMDM3bDAuNDQ1LTEuMTQ4bDIuNzcxLTAuOTk1bDAuMDItMC4zODRsLTAuMzg1LTAuMDJsMC4wMjEtMC4zODRsMC4wMi0wLjM4NGwwLjAyMS0wLjM4NGwxMy4yNDYtNy43NDlsMC40MDQtMC4zNjRsMC4wMjEtMC4zODRsLTAuMzg1LTAuMDJsLTAuMzY1LTAuNDA0bC0wLjM4NS0wLjAybC0wLjM2NS0wLjQyMWwtMC4zNDUtMC43ODhsLTAuMzY0LTAuNDA0bC0wLjc1LTAuNDI0bDAuMDItMC4zODRsLTAuMzI3LTAuODA0bC0wLjM2NS0wLjQwNGwwLjAyLTAuMzg0bC0wLjM4NS0wLjAybC0wLjM4NS0wLjAybC0wLjM4NS0wLjAybC0wLjM4NS0wLjAzN2wwLjAyLTAuMzg0bC0wLjM4NS0wLjAyMWwtMC4zNjUtMC40MDRsLTAuMzg1LTAuMDJsLTAuMzY0LTAuNDA0bC0wLjM4Ni0wLjAybC0wLjQwMS0wLjAzN2wtMC4zNDgtMC40MDRsLTAuNDAyLTAuMDJsLTAuMzg1LTAuMDJsMC4wMjEtMC4zODRsMC4wMzYtMC4zODRsMC43OS0wLjM0NGwwLjAyMS0wLjM4NGwwLjQyNS0wLjc0OGwwLjgwNy0wLjM0M2wwLjQyNi0wLjc0OGwwLjAyLTAuMzg0bDAuODQ4LTEuMTExbDAuMDQtMC43NjhsMC40MDQtMC4zNjRsMC4wMjEtMC4zODRsMC4wMjEtMC4zODRsMC40ODEtMS41MzJsMC40MDUtMC4zNDdsMC40MDUtMC4zNjRsMC40MjItMC4zNjNsMC4wMi0wLjM4NGwwLjAyMS0wLjRsMC40MDQtMC4zNDdsMC40MDUtMC4zNjRsMC4wMjEtMC40MDFsMC40NDEtMC43NDhsMC44MTEtMC43MTFsMC43OS0wLjM0NGwtMC42NTItMS45NzZsLTAuNzEtMS4xOTJsMi4wNDItMS44MTlsMC4zNjQsMC40MDRsMC43MywwLjgwOGwwLjc0OSwwLjQ0bDAuMzY1LDAuNDA0bC0wLjAyLDAuMzg0bDAuMzg1LDAuMDJsLTAuMDIxLDAuMzg0bC0wLjAyLDAuMzg0bDAuMzg1LDAuMDJsMC4zNjQsMC40MjFsLTAuMDIsMC4zODRsLTAuMDM3LDAuMzg0bDAuNDAyLDAuMDIxbDAuMzg1LDAuMDJsMC43NSwwLjQyNGwtMC4wMjEsMC40bDAuNjkyLDEuMTkybC0wLjAyLDAuMzg0bC0wLjAyMSwwLjM4NGwtMC4wMiwwLjM4NGwwLjM4NSwwLjAyMWwtMC4wMiwwLjM4NGwwLjM4NSwwLjAzN2wwLjM2NCwwLjQwNGwwLjc3MSwwLjA0bDAuMzg1LDAuMDJsMS4xNzUtMC4zMDdsMi4zNDctMC4yNjNsMC40ODEtMS41MTVsMC4zODUsMC4wMmwxLjU4LTAuNjcxbDAuMzg1LDAuMDJsMC44MDgtMC4zNDRsMC4zODUsMC4wMmwwLjM4NSwwLjAybDAuODMtMS4xMTFsMC40MjItMC4zNjRsMC40MjUtMC43NDhsMC40MDUtMC4zNjRsMC43OS0wLjM0NGwwLjQyMi0wLjM2M2wwLjc5LTAuMzI3bDIuMDAyLTEuMDUxbDEuNjk3LTIuNjA3bDAuNDQ1LTEuMTMxbDAuNDQxLTAuNzQ4bDEuMTk1LTAuNzA4bDAuNzUsMC40MjRsMS4xOTEtMC4zMDdsMS41OC0wLjY4OGwwLjQ2Mi0xLjEzMWwxLjYwMS0xLjA3MWwwLjQyMS0wLjM2NGwxLjIzNS0xLjQ3NmwwLjM4NiwwLjAyMWwwLjQ0MS0wLjc0OGwxLjYtMS4wNTVsMi4wNDMtMS44MTlsMC44MDctMC4zNDRsMC40MjUtMC43NDhsMC4wNjEtMS4xNTJsMC40NjItMS4xMzFsMC43OS0wLjM0NGwwLjgyNy0wLjcyOGwxLjU2LTAuMzA0bDIuMTAzLTIuOTcxbDEuNTU3LDAuMDk3bDEuMjE1LTEuMDkxbDAuODQ3LTEuMTExbDAuNzcxLDAuMDRsMS41OTYtMC42NzFsMC40MjYtMC43NDhsMi44MTItMS43NzlsMC44NDgtMS4xMTFsMC44MS0wLjcyOGwwLjAyMS0wLjM4NGwyLjQyNy0xLjc4MmwxLjE5MS0wLjMyNGwwLjQyNS0wLjc0OGw1LjA5OS0wLjg3NGwxLjkyNSwwLjExN2wxLjk0NC0wLjI4NGwyLjY5MSwwLjU0MmwwLjc3LDAuMDU3bDEuMDc5LDEuNTk2bDEuMTk0LTAuNjkxbDEuMjEyLTAuNzA4bDEuMTk1LTAuNzA4bDAuNDYyLTEuMTMxbDIuMzMtMC4yNDdsMy4xNzctMS4zNzVsMi4yODYsMC45MDVsMS45ODQtMS4wMzVsMS4yNzItMS44NTlsMC43NywwLjA0bDEuNTk4LTAuNjg3bDEuMTc1LTAuMzA3bDQuMzg4LTIuMDY2bDIuMzg3LTEuMDMxbDMuMTU3LTAuOTc1bDAuNzcsMC4wNGwxLjIzMi0xLjA5MWwwLjc5LTAuMzI3bDEuNTc5LTAuNjg4bDAuNDIyLTAuMzY0bDEuMjE2LTEuMDkxbDIuMzQ3LTAuMjQ3bDIuMTUxLDIuODI0bDQuMDM0LDQuMDkzbDAuNzI5LDAuODI1bDEuNDU5LDEuNjMybDIuODgyLDMuNjMybDEuMjEyLTAuNjlsMC40MjUtMC43NDhsMi4wMjItMS40MzVsMi4zODctMS4wMzFsMi40MjctMS43ODJsMi4wMjEtMS40MzZsMC4zNjUsMC40MDRsMC43MjksMC44MjRsMS4xMzUsMC40NDRsMS4wOTUsMS4yMjlsMS4xMTQsMC44MjhsMC43OS0wLjMyN2wwLjM4NSwwLjAybDEuMTU1LDAuMDZsMS44NDUsMS42NTJsMS4xMTQsMC44NDVsMS42NTctMS44MzlsMC44ODctMS44NzlsMC4wNjEtMS4xNjhsMC4wMjEtMC4zODRsMC4wMi0wLjM4NGwtMC4zNjUtMC40MDRsMC4wMzctMC4zODRsMC4wMjEtMC4zODRsMC4wMi0wLjM4NGwwLjM4NSwwLjAybDAuMDIxLTAuMzg0bDAuMDItMC4zODRsMC40NDItMC43NDhsMC4wMi0wLjM4NGwwLjA0MS0wLjc4NWwwLjA2MS0xLjE1MWwwLjM4NSwwLjAybDAuMDM2LTAuMzg0bDAuMDQxLTAuNzY4bC0wLjM2NS0wLjQwNGwtMC4zNDUtMC43ODhsLTAuMjQ4LTIuMzRsMC40ODYtMS44OTlsLTAuNjEzLTIuNzQ0bC0wLjI2OC0xLjk1NmwwLjQwNS0wLjM2NGwwLjM4NSwwLjAzN2wwLjM4NSwwLjAybDAuMDIxLTAuMzg0bDAuMzg1LDAuMDJsMC40MjItMC4zNjRsMC4zODUsMC4wMmwwLjA0LTAuNzY4bDAuNDA1LTAuMzY0bDIuNjM1LDEuMzA5bDAuNDA1LTAuMzY0bDAuODY2LTEuNDk1bDAuMDIxLTAuMzg0bDAuMDItMC4zODRsMC40NjItMS4xMzFsMC4wMjEtMC4zODRsMC4zODUsMC4wMmwwLjc3MSwwLjA0bDAuMzg1LDAuMDJsMC4zODUsMC4wMmwwLjAyMS0wLjM4NGwwLjQwMSwwLjAybDAuNDA1LTAuMzY0bDAuNDI1LTAuNzQ4bDAuNDI1LTAuNzQ4bDAuNDIyLTAuMzYzbDAuODMtMS4xMTJsMS4yMTItMC42OWwwLjgzLTEuMTEybDAuMDIxLTAuNGwxLjI1Mi0xLjQ1OGwwLjQwNS0wLjM2NGwwLjAyLTAuNGwwLjgyNy0wLjcxMWwwLjc5LTAuMzQ0bDEuMjcxLTEuODU5bDAuODQ4LTEuMTExbDAuNzktMC4zNDRsMS41OC0wLjY4OGwwLjgwNy0wLjM0MyBNNDgwLjg4OCwxMTUuODI0bC0yLjEzOSwwLjU1OWwtMi43NjIsMC41NjJsLTAuNzctMC4wNTNsLTAuMzg0LTAuMDI3bC0wLjQyOCwwLjM1NmwtMC4wMjcsMC4zODRsLTAuNDExLDAuMzU2bC0wLjQxMSwwLjM1N2wtMC43OTYsMC4zM2wtMC43ODUtMC4wN2wtMC4wMjcsMC4zODNsLTAuNzk2LDAuMzNsLTIuODE1LDEuMzQ2bC0xLjE4LDAuMjg2bC0xLjYwOSwwLjY1OWwtMC40MTEsMC4zNTdsLTIuNDg0LDIuMTRsLTAuODQsMC43MTNsLTAuMDI2LDAuMzg0bDEuMDczLDEuMjNsMC4zNTcsMC40MTFsMi4xMDMsMi44NzhsMS40NTcsMS4yNzRsLTAuNDM4LDAuNzRsLTAuNzY5LTAuMDdsLTEuNjA5LDAuNjU5bC0xLjYxOCwxLjA0M2wtMC44MTIsMC4zMjlsLTEuMjA3LDAuNjdsLTAuODM5LDAuNzEzbC0wLjgyMywwLjcxM2wtMS4yNTEsMS4wNjlsLTAuODIyLDAuNzEzbC0wLjQxMSwwLjM1N2wtMC40MTEsMC4zNTZsLTEuMjUxLDEuMDdsLTEuMjUxLDEuMDUzbC0wLjg0OSwxLjA5N2wtMC44NCwwLjcxM2wtMC4wMjYsMC4zODNsLTAuNDEyLDAuMzU3bC0wLjA1NCwwLjc4NGwtMC44NjYsMS4wOTZsLTAuMDI2LDAuMzg0bC0wLjQzOCwwLjc0bC0wLjAyNiwwLjM4M2wtMC4wNDQsMC4zODNsLTAuNTE5LDEuODkxbC0wLjAyNiwwLjM4NGwwLjI4NywxLjE5M2wtMC4wNTQsMC43NjdsLTAuMDI3LDAuMzgzbC0wLjAyNiwwLjM4NGwtMC40NTUsMC43MzlsLTAuODIyLDAuNzE0bC0wLjQzOCwwLjc0bC0wLjAyNiwwLjM4M2wtMC40MjksMC4zNTZsLTAuMDI2LDAuMzg0bC0wLjAyNiwwLjM4M2wtMC44NSwxLjA5N2wtMC40MjksMC4zNTZsLTAuMDUzLDAuNzY3bC0wLjQ2NSwxLjEyNGwtMC4zODUtMC4wMjdsLTAuNDI5LDAuMzU2bC0xLjE4LDAuMzAzbC0wLjQxMiwwLjM1NmwtMC4zODQtMC4wMjZsLTAuODM5LDAuNjk2bC0wLjgyMywwLjcxNGwtMC40MzgsMC43NGwtMC40MjgsMC4zNTZsLTAuMDU0LDAuNzY3bC0wLjA1NCwwLjc4NGwtMC4wOTcsMS4xNWwtMC4wMjcsMC4zODNsLTAuNDkxLDEuNTA3bC0wLjQyOSwwLjM1NmwtMC40MTEsMC4zNTZsLTAuMzg1LTAuMDI3bC0wLjgyMiwwLjcxM2wtMC44MTIsMC4zM2wtMC40MTEsMC4zNTdsLTAuMDI3LDAuMzgzbC0wLjAyNiwwLjM4M2wtMC4wNTQsMC43NjdsLTAuNDExLDAuMzU3bC0wLjg5NCwxLjQ3OWwtMS41MTEtMC41MDdsLTIuNjU0LTAuOTcybC0xLjg5Ni0wLjUxOGwtMC43NjktMC4wN2wwLjAyNy0wLjM4M2wtMS4yMzQsMS4wN2wtMy4yNzEsMi4wODVsLTIuNDMxLDEuMzU2bC0zLjI4MSwyLjQ3bC0yLjQ3NCwxLjczOWwtMS45NzcsMC42MzNsLTEuMjUxLDEuMDY5bC0xLjU2NCwwLjI2bC0wLjQxMSwwLjM1N2wtMC44MTIsMC4zM2wtMC44NSwxLjA5N2wtMS4zNTgsMi42MDRsLTAuMDQzLDAuMzgzbDAuMzU3LDAuNDExbC0wLjAyNiwwLjM4M2wtMC4wMjcsMC40bDAuNzQyLDAuNDM3bC0wLjAyNiwwLjM4M2wtMC4wNTQsMC43NjdsLTAuNDgxLDEuMTIzbC0wLjA1NCwwLjc2N2wtMC40NjYsMS4xNGwtMC4wNDMsMC4zODNsMS43NjIsMi40NTFsLTAuMDI3LDAuMzg0bDEuMzc3LDIuNDI1bDAuNjk5LDAuODJsLTAuODIzLDAuNzEzbC0xLjIwNywwLjY4N2wtMS4yMjQsMC42ODdsLTEuMjA3LDAuNjdsLTAuODEyLDAuMzI5bC0wLjAyNiwwLjM4NGwwLjY4OCwxLjIyMWwwLjM1OCwwLjQxbC0wLjA5OCwxLjE1bC0wLjQzOCwwLjc0bC0xLjI1MSwxLjA3bC0wLjQzOCwwLjc0bC0wLjQ5MSwxLjUwN2wtMC4wNDQsMC4zODNsLTAuMDI3LDAuNGwtMC4wMjYsMC4zODRsLTAuNzk2LDAuMzEzbDAuMzU3LDAuNDI3bC0wLjM4NC0wLjAyN2wtMS42NjIsMS40MWwtMC41MDksMS41MjNsLTAuNDExLDAuMzRsLTAuOTIsMS44OGwtMC44NSwxLjA5N2wtMS43MTYsMi4xOTNsLTAuODM5LDAuNjk2bC0wLjc5NiwwLjMzbC0wLjM4NS0wLjAyNmwtMC43OTYsMC4zM2wtMC4zMzEtMC43OTNsLTAuMDk4LDEuMTVsLTAuMDUzLDAuNzY3bC0wLjAyNywwLjM4NGwtMC40NjUsMS4xMjRsLTAuNDU1LDAuNzRsLTAuNDExLDAuMzU3bC0wLjQxMSwwLjM1NmwtMC44NCwwLjcxM2wtMC43OTYsMC4zM2wtMC44MjIsMC43MTNsLTAuNjg4LTEuMjIxbDAuNzk2LTAuMzEzbC0wLjM1Ny0wLjQyN2wxLjYwNy0wLjY0M2wtMC4yNzYtMS41NzhsLTAuNzctMC4wNTNsLTEuNTkyLDAuNjZsMC4zNDEsMC40MWwtMS42MTgsMS4wNDNsLTAuNzk1LDAuMzEzbC00LjA4Ni0yLjYyOWwtMC40MTEsMC4zNTZsLTAuMzg1LTAuMDI3bC0wLjM1Ny0wLjQxbC0wLjAyNywwLjM4NGwtMC43OTYsMC4zM2wtMC4wMjYsMC4zODRsLTAuMzg1LTAuMDI3bC0wLjgxMiwwLjMzbDAuMDI3LTAuMzg0bDAuMzg0LDAuMDI3bC0wLjc0MS0wLjQ1NGwtMC42OTktMC44MmwtMS4xLTAuODY0bC0wLjcxNi0wLjgyMWwtMS40NTctMS4yNzRsLTAuNzE2LTAuODIxbC0xLjEtMC44NjRsLTAuNzE2LTAuODJsLTAuNjYxLTEuNjA0bC0wLjI4Ny0xLjE3N2wtMC42NjItMS42MDRsLTAuNzE1LTAuODIxbC0xLjYzNiwxLjA0M2wtMS45NDksMC4yMzNsLTEuMjI0LDAuNjg2bC0wLjg1LDEuMDk3bC0xLjE5NywwLjMwM2wtMC40MTEsMC4zNTZsLTEuMjA3LDAuNjdsLTAuODQsMC43MTNsLTAuMzg0LTAuMDI3bC0wLjQxMiwwLjM1N2wtMC4zODQtMC4wMjdsLTAuNDM4LDAuNzRsLTAuNzQyLTAuNDM3bC0wLjM1Ny0wLjQyN2wtMC4zODUtMC4wMjdsLTAuMzU3LTAuNDFsLTAuMzU4LTAuNDFsLTAuMzg0LTAuMDI3bC0wLjAyNywwLjM4M2wtMC4wNywwLjc2N2wtMC40MTEsMC4zNTZsLTAuODIyLDAuNzEzbC0wLjQ1NSwwLjc0bC0wLjQxMSwwLjM1N2wtMC4wMjcsMC4zODNsLTAuNzk2LDAuMzNsLTAuNDI4LDAuMzU2bC0wLjM4NS0wLjAyN2wwLjcxNiwwLjgybC0wLjg3NiwxLjQ4bDAuNjQ1LDEuNjA0bC0wLjAyNiwwLjM4NGwtMC43NDItMC40NTRsLTAuODIzLDAuNzEzbDAuNzE2LDAuODM3bDAuMzU3LDAuNDFsLTEuMTk3LDAuMzAzbC0xLjU2NCwwLjI2bC0wLjc3LTAuMDUzbC0wLjc4NS0wLjA1NGwxLjA0NiwxLjYxNGwtMC44MjIsMC43MTNsLTEuNzQyLDIuNTc3bC0wLjQ4MiwxLjEyNGwwLjM1NywwLjQyN2wtMC4zODQtMC4wNDNsMC4zNTcsMC40MjdsLTAuNDExLDAuMzU2bC0wLjAyNywwLjM4M2wtMC4wNDMsMC4zODNsLTAuODIzLDAuNzEzbDAuNzE2LDAuODJsLTAuODY2LDEuMDk3bC0wLjg1LDEuMDk3bC0wLjc0Mi0wLjQzN2wtMC40NTUsMC43NGwtMS44NjgtMC45MTdsLTAuMzU4LTAuNDFsLTAuNDExLDAuMzU2bC0wLjMzLTAuODFsLTAuNzk2LDAuMzNsLTAuNzk2LDAuMzNsLTAuMzg1LTAuMDI3bC0wLjgxMiwwLjMzbC0wLjcxNi0wLjgzN2wtMi44NDIsMS43MjlsLTAuMzU4LTAuNDFsLTAuMzU3LTAuNDI3bC0wLjcxNS0wLjgyMWwtMC4zNDItMC40MWwtMS4wNzItMS4yNDhsLTAuNzE2LTAuODJsLTAuNzE1LTAuODM3bC0wLjc3LTAuMDUzbC0xLjE1My0wLjA4MWwtMS4xOTcsMC4yODZsLTAuMzg0LTAuMDI3bC0wLjM4NS0wLjAyN2wtMS41MzgtMC4xMDdsLTEuMTk3LDAuMjg2bC0wLjc5NiwwLjMzbC0xLjIwNywwLjY4N2wwLjMxNCwwLjc5M2wtMS4yMDcsMC42ODdsLTAuODQsMC43MTNsLTAuMDI2LDAuMzg0bC0wLjA1NCwwLjc2N2wtMC4zODUtMC4wMjZsLTAuMDI2LDAuMzgzbC0xLjIyNSwwLjY4NmwtMC40MzgsMC43NGwtMC44MjMsMC43MTNsLTIuMTE2LDIuMTY3bC0wLjM4NS0wLjA0NGwtMi4wNzMsMS43ODNsLTAuODIyLDAuNzEzbC0wLjc5NiwwLjMzbC0wLjQyOSwwLjM1NmwtMC4zODUtMC4wMjZsLTIuNDAzLDAuOTczbDEuNDAzLDIuMDQxbDAuMzU4LDAuNDFsMC4yNzYsMS41NzhsLTAuMDI2LDAuMzgzbC0xLjU1NS0wLjEyNGwtMC43NjktMC4wNTRsLTAuNzctMC4wNTRsLTEuOTIyLTAuMTVsLTAuNDAxLTAuMDI3bC0xLjE1NC0wLjA4bC0xLjUzNy0wLjEyNGwtMC4wNTQsMC43NjdsLTAuMTI0LDEuNTVsMC4xNTMsMy4wOTRsLTAuMDI1LDUuNDI4bC0wLjEwNiwxLjUzNGwwLjMwNCwxLjE3N2wxLjE1MywwLjA5N2wtMC4wNTQsMC43NjdsLTEuMjUsMS4wN2wwLjcxNSwwLjgybDAuNzQyLDAuNDU0bDEuNDg0LDAuODc0bC0xLjYwOCwwLjY2bC00LjQwNywxLjk4OWwxLjU0LDUuMTUxbDIuODA5LDQuMDY2bDAuMzg0LDAuMDQzbDEuNjkxLDMuMjE4bDAuNDExLTAuMzU2bDAuMDQ0LTAuMzgzbDAuMDU0LTAuNzY3bDAuMDU0LTAuNzgzbDAuMDI3LTAuMzg0bDAuMzg0LDAuMDQzbDAuMzg1LDAuMDI3bDAuMzg0LDAuMDI3bDAuMzU4LDAuNDFsLTAuMDI3LDAuMzgzbC0wLjAyNiwwLjM4NGwwLjM4NSwwLjAyNmwwLjQ1NS0wLjczOWwwLjQxMS0wLjM1N2wwLjQzOC0wLjc0bDAuNDExLTAuMzU2bDAuMDI3LTAuMzg0bDAuNDAxLDAuMDI3bDAuMDI2LTAuMzgzbDAuMzU3LDAuNDFsLTAuMDQ0LDAuMzk5bC0wLjAyNiwwLjM4NGwwLjc4NiwwLjA1NGwwLjM4NSwwLjAyN2wtMC4wNDQsMC4zODNsMC40MDEsMC4wMjdsLTAuMDQ0LDAuMzgzbC0wLjA1NCwwLjc2N2wwLjM4NSwwLjA0M2wwLjc0MiwwLjQzN2wwLjM4NSwwLjAyN2wxLjE3LDAuMDgxbDAuMzg1LDAuMDQ0bDAuMDU0LTAuNzg0bDAuNzk1LTAuMzEzbDAuMDI3LTAuMzgzbDAuMzg1LDAuMDI3bDAuMzU3LDAuNDFsLTAuNDExLDAuMzU2bC0wLjM4NS0wLjAyN2wtMC4wMjYsMC4zODRsLTAuMDI3LDAuMzgzbC0wLjAyNiwwLjM4NGwwLjM4NSwwLjAyN2wwLjQxMS0wLjM1N2wwLjM4NSwwLjAyN2wwLjMwNCwxLjE5NGwwLjM4NCwwLjAyN2wwLjM4NSwwLjAyNmwwLjM4NSwwLjAyN2wwLjM4NSwwLjAyN2wtMC41OSwyLjY3NGwtMC45MTksMS44NjNsMC44MTItMC4zMjlsMC4zNDEsMC40MWwwLjM1NywwLjQxbDAuNzE2LDAuODM3bDEuMDIsMS45OThsMC43MTUsMC44MzdsMC42NDYsMS41ODdsMC4yNzYsMS41NzdsMS4xNTQsMC4wODFsLTAuMDI3LDAuMzgzbC0wLjIwNCwyLjcwMWwtMC43Ny0wLjA1M2wwLjUxMSwzLjUyMWwtMy4wOTMtMC4yMzFsLTEuMTgsMC4yODdsLTEuOTQ5LDAuMjVsLTAuMzg1LTAuMDI3bDAuMjg3LDEuMTc3bC0wLjAyNiwwLjM4M2wtMC4wMjcsMC4zODRsMC4zMzEsMC43OTNsMC4zMjYsNi42MzlsLTQuNzA5LDUuODQgTTU3NS4zLDQwMS4wMjRsLTAuMzg2LTAuMDIxbC0xLjE1NC0wLjA2M2wtNC45MzUtMS44NDhsLTguMzE2LTMuMjA3bC0wLjM2My0wLjQyMmwtMy44MDItMS4zODNsLTEuNTE4LTAuNDg2bC0yLjI2Ni0wLjkxMmwtOC42OTctMy42MTNsLTYuMDA4LTMuMDhsLTMuNzQxLTIuMTY2bC0xLjQ5Ny0wLjg1NGwxLjI0LTEuNDcxbDUuMTM2LTcuODAzbC03Ljc4MS01Ljg5bC0wLjcyOC0wLjgyN2wtMC4zNDItMC43ODlsLTAuNjg4LTEuMTkzbC0wLjcwNS0xLjIxMWwtMS4wNDgtMmwtMS4wMDktMi4zODVsMC4wNDMtMC43NjhsLTAuMzQyLTAuNzg5bDAuMjEtMy40NzFsLTAuNzkyLDAuMzQybC0wLjc0OC0wLjQyOGwtMC43MjctMC44MjZsLTAuMzg1LTAuMDIxbC0xLjU0LTAuMDg2bC0xLjk4MywwLjY0NGwtMC43OTEsMC4zNDFsLTAuNzkyLDAuMzQybC00LjI1LTAuMjdsLTMuMzM1LTIuNTEybDAuMDIxLTAuMzg1bDAuMDQzLTAuNzY4bC0wLjM4NS0wLjAzN2wwLjAyMS0wLjM4NWwwLjQ2Ni0xLjEyOWwwLjA0My0wLjc2OGwwLjA0My0wLjc2OGwtMC4zNDMtMC43ODlsLTAuNzQ4LTAuNDQzbC0wLjgzNCwxLjEwN2wtMS40NzUtMS4yMzZsLTEuMTM0LTAuNDY1bC0wLjM0Mi0wLjc4OWwxLjIzNS0xLjA4N2wtMi45MjktMi44OTJsLTEuNjIsMS4wNjZsLTAuNzctMC4wNDNsLTAuMzYzLTAuNDA2bC0wLjM0My0wLjgwNWwtMS4xMTEtMC44MzJsLTIuODQsMi4xMzZsMS40MzMsMi4wMjFsLTAuOTE1LDIuMjZsLTAuMzYzLTAuNDA1bC0wLjM2My0wLjQwNGwtMC4zNjQtMC40MDZsLTEuNzk1LTIuNDI2bC0wLjM4NS0wLjAyMWwtMC4zNjMtMC40MjJsLTAuMzY0LTAuNDA2bC0xLjQ3NS0xLjI1M2wwLjQyMy0wLjM2MmwwLjgxMi0wLjcwOGwtMC4zNjMtMC40MjJsLTAuMzYzLTAuNDA1bC0wLjM2My0wLjQwNWwtMC4zODUtMC4wMjFsLTAuODEzLDAuNzI1bC0xLjE3MS0wLjA4MWwtMS41NjEsMC4yOTlsMC4wNjQtMS4xNTJsMC4wMjEtMC4zODNsLTAuMjYxLTEuOTU3bC0wLjc3LTAuMDQzbC0xLjUzOS0wLjEwM2wtMC40MDEtMC4wMjFsLTIuODkxLTMuMjc0bC0yLjY1MS0wLjkzNmwtNC4xNDQtMi4xNzFsLTAuMzg1LTAuMDM4bC0xLjkwMi0wLjQ5bC0wLjc3LTAuMDYxbC0wLjM4Ni0wLjAyMWwtMC4zNjMtMC40MDVsLTAuNzkxLDAuMzQxbC0wLjQyMywwLjM2MmwtMC4zODUtMC4wMjFsLTAuODEyLDAuNzI1bC0xLjE5MywwLjMwM2wtMC4zODUtMC4wMjFsMC43NDgsMC40NDNsLTAuMDIxLDAuMzg1bC0wLjg1NSwxLjQ5MmwtMC40NDQsMC43NDZsLTEuMzQzLDMuMDA2bC0wLjQ0OSwxLjEzbC0wLjQ0NCwwLjc0NmwtMC44MzQsMS4xMDhsLTAuMDIxLDAuMzg0bC0wLjQyMywwLjM2MmwtMC40MDYsMC4zNjJsLTAuMDIxLDAuMzg0bC0wLjQ4NywxLjUxNGwtMC40MjgsMC43NDZsLTAuMDIxLDAuMzg1bC0wLjAyMSwwLjRsNi4xODMsNi41NTVsMC4zNjMsMC40MDRsMS40NzYsMS4yNTRsMS40NTMsMS42MzlsMS4wOTEsMS4yMTVsMS4wNzMsMS4yMzJsMi4yMjQsMS42OGwtMC40NzEsMS41MTVsLTAuNDQ0LDAuNzQ1bC0wLjgzNSwxLjEwOWwtMS4xMTEtMC44MzJsLTAuNzkxLDAuMzQybC0xLjIzNiwxLjA4NmwtMS41MTgtMC40ODZsLTIuNjMtMS4zMTdsLTEuNTE4LTAuNDg2bC0yLjI2Mi0xLjI5NmwtMy40NDItMC41OTRsLTAuNzctMC4wNDNsLTAuMzYzLTAuNDIybC0xLjkyLTAuNDkxbC0yLjk4NSw0LjQ1NmwtMC44MTIsMC43MjVsLTAuNDI4LDAuNzQ2bC0xLjc0NCwyLjk4NGwtMC4wMjEsMC4zODVsLTAuMDIxLDAuMzgzbC0xLjI3OCwxLjg1NWwtMS4yNzgsMS44NTRsLTEuNzA3LDIuNjAybC0wLjQ0OSwxLjEzbC0wLjQyMywwLjM2MmwtMC4wMjEsMC4zODRsLTAuODEyLDAuNzI2bC0wLjQwNiwwLjM2MWwtMC40NjYsMS4xMzFsLTEuNDc2LTEuMjU0bC0yLjIyMy0xLjY4MWwtMS42NDMsMS40NDlsLTEuNjI1LDEuNDVsLTIuNDEyLDEuNDA2bC0zLjIyLDEuNzNsLTMuMTU5LDAuOTYzbC0wLjM4Ni0wLjAyMWwtMS4xMTEtMC44NDhsLTMuMTYsMC45OGwtMS40NzUtMS4yNTRsLTEuODM5LTEuNjZsLTIuOTA0LDMuMzA1bC0yLjA0OCwxLjgxMmwtMi4wNjksMi4xNzlsLTAuMzYzLTAuNDA1bC0xLjUzNS0wLjQ3bC0wLjM2My0wLjQyMmwtMC4zODUtMC4wMjFsLTEuMTM0LTAuNDQ4bC0wLjY4OC0xLjIxMWwtMi40MTIsMS40MDZsLTAuODI5LDAuNzI1bC0yLjQzMywxLjc3NGwtMy40NTktMC41OTRsLTAuNzQ5LTAuNDI3bC0xLjUxOC0wLjQ4NmwtMS4xMzQtMC40NDdsLTMuODY1LTAuMjQ4bC0zLjQ0Mi0wLjU5M2wtMS45ODMsMC42NmwtMS44OS03LjA4N2wtMC4xNTMtMy44NzZsMC4wMjEtMC4zODRsMC41MDktMS44OTdsMi4zNDgtMC4yMzhsMC43NywwLjA0MmwwLjc3MSwwLjA0M2wwLjQwNi0wLjM2MWwyLjQzMy0xLjc3NGwwLjQ0NC0wLjc0NmwxLjc1LTMuMzg2bDEuNzg3LTMuNzUybC0wLjc3LTAuMDQzbC0xLjQ5Ny0wLjg2OWwtMS45MTktMC41MDhsLTMuMDM2LTAuOTU1bDIuMTEyLTIuOTY0bC0wLjc0OC0wLjQyN2wtMC4zNjMtMC40MDVsLTEuNzc5LTIuNDI3bDAuODM0LTEuMTA4bDAuNDg3LTEuNTNsMC44MzQtMS4xMDhsMC44OTUtMS44NzZsMS4zLTIuMjM4bDEuMzIxLTIuNjIzbC0xLjExMS0wLjgzMmwtNC4wODQtMi45NTVsLTAuNzEtMC44MjZsLTEuMTQ5LTAuNDQ5bC0xLjEzNC0wLjQ2NWwtMC43NDgtMC40MjZsLTMuMDU4LTAuNTcybC0xLjEzMy0wLjQ2NWwtMC43Ny0wLjA0M2wtMC43NDktMC40MjZsLTEuMTQ5LTAuNDY1bC0xLjUxOS0wLjQ3bC0xLjIxOSwxLjA3bC0xLjIzNSwxLjA4N2wtMS42NjMsMS44MzRsLTIuMjg4LTAuNTI5bDAuMzA0LDEuMTg5bC0wLjQ3MSwxLjUxNGwtMC40MDYsMC4zNjJsLTEuMjc4LDEuODU0bC0wLjc3MS0wLjA0M2wtMS4xOTIsMC4zMDNsLTAuMzg1LTAuMDIxbC0xLjIzNSwxLjA4OGwtMS41ODMsMC42ODJsLTIuMjg3LTAuNTI5bC0xLjQ3Ni0xLjI1NGwtMS4xOTIsMC4zMmwtMC4zMDQtMS4xODlsLTAuMzYzLTAuNDA2bC0wLjM4Ni0wLjAyMWwtMC43ODYtMC4wNDNsLTAuNzctMC4wNDJsLTAuNDA2LDAuMzQ2bC0wLjQ0OSwxLjE0NmwtMC40MDEtMC4wMzhsLTEuMTc3LDAuMzE5bC0wLjM4NS0wLjAyMWwtMC4zNjMtMC40MDZsLTAuMzYzLTAuNDA0bC0wLjcyNy0wLjgyOGwtMC43MjgtMC44MTFsLTEuNTM5LTAuMTAybC0wLjQwNiwwLjM2MmwtMC4zNjMtMC40MDVsLTIuMjg4LTAuNTI5bC0wLjc4Ni0wLjA0M2wtMS4xNzcsMC4zMmwtMS44NTktMS4yNzVsLTAuMzg1LTAuMDIxbC0xLjgxNy0yLjA0M2wtMS45MDItMC41MDhsLTEuODgyLTAuODkxbC0wLjM4NS0wLjAyMWwtMS44ODItMC44OTJsLTEuNTM0LTAuNDg2bC0yLjI0NS0xLjI5N2wwLjQ0NC0wLjc0NWwtMC4zNjMtMC40MDZsLTIuOTcyLTIuMTA2bC0xLjg2LTEuMjc1bC01LjE5NC0zLjgwNGwtMi4yNDUtMS4yOTdsLTAuNzI3LTAuODExbC0yLjIyNC0xLjY4bC02LjA0Ni0yLjY5NmwtMC44MTIsMC43MjVsLTEuMTc2LDAuMzJsLTEuMjM2LDEuMDg3bC0zLjI2MiwyLjQ5OWwtMS42MjYsMS40NDlsLTAuODA4LDAuMzQxbC0xLjIxOSwxLjA4N2wtMS4xMzMtMC40NjVsLTIuOTIxLDMuMzA1bDAuMzYzLDAuNDA1bC0zLjIwMywxLjc0N2wxLjExMiwwLjgzMmwtMS4yNzksMS44NTVsLTAuNDIzLDAuMzYxbC0xLjYwNCwxLjA2NmwtMC43NDgtMC40MjdsLTQuOTY5LDUuMDk5bC0xLjMyMiwyLjYyM2wtMC44NTEsMS4xMDhsLTAuNDQ5LDEuMTNsLTAuNDQ0LDAuNzQ2bC0wLjgzNCwxLjEwOWwtMC44NTEsMS4xMDdsLTAuNDI4LDAuNzQ2bC0wLjg3MywxLjUxbC02LjQwNSwzLjQ2MWwtMS4xOTMsMC4zMmwtMS45NjcsMC42NmwtMC40MDYsMC4zNDZsLTEuOTYzLDAuMjc3bC0yLjMzLDAuMjM4bC0wLjQwMi0wLjAyMSBNNTUyLjU5NSwxNzguMjU1bC0wLjEyOS0xLjU2MmwwLjA0OCwyLjcxMmwtMC40NTQsMC43NGwtMC40MzgsMC43NGwtMC40MTEsMC4zNTZsLTAuNDgxLDEuMTI0bC0wLjEwNywxLjUzNGwtMC4wNzEsMC43ODNsLTAuMTM0LDEuOTE3bC0wLjA3LDAuNzY3bC0wLjA1MywwLjc2N2wtMC4wMjcsMC4zODNsLTAuNDM4LDAuNzRsLTEuNzQzLDIuNTc3bC0wLjA3LDAuNzgzbC0wLjQzOCwwLjc0bC0wLjUwOCwxLjUwN2wtMC4wNTQsMC43NjdsLTAuODUsMS4wOTdsLTAuMDQ0LDAuMzgzbC0wLjM4NS0wLjAyN2wtMC40NjUsMS4xMjRsLTAuMDUzLDAuNzY3bC0wLjAyNywwLjM4M2wwLjM4NSwwLjAyN2wwLjY3MiwxLjIybC0wLjQzOCwwLjc0bC0wLjA4LDEuMTVsMC4zODUsMC4wMjdsLTAuODQsMC43MTNsNC41NSwxLjUwNWwtMC4wMjYsMC4zODRsMC42NzIsMS4yMmwxLjAyLDEuOTk4bDEuMjc3LTEuNDUzbDAuODUtMS4wOTdsMi44MzUsMy42OTlsMS4wNzIsMS4yNDhsMy4yMDIsMy43MjZsLTIuOTIyLDIuODYzbC0yLjUyOCwyLjUyM2wtMi45MjMsMi44OGwtMC4wMjcsMC4zODRsLTEuNjM1LDEuMDQybC0wLjQxMiwwLjM1N2wtMy4yNywyLjA2OWwtMS40NTgtMS4yNzRsLTAuNzQyLTAuNDM3bC0xLjgxNC0xLjY4NWwtNC4wNjktMi42MjlsLTIuODk4LTIuNTMybC0wLjA3LDAuNzY3bC0wLjkyLDEuODYzbC0wLjQzOCwwLjc0bC0wLjQ2NSwxLjEyNGwtMC4wMjYsMC4zODRsLTAuMDQ0LDAuMzgzbC0wLjEzNCwxLjkzNGwtMC40MTEsMC4zNTdsLTAuMDQ0LDAuMzgzbC0wLjQxMSwwLjM1N2wtMC4wMjcsMC4zODNsLTAuMzg0LTAuMDI2bC0zLjE3NCwwLjkxOWwtMC4zODQtMC4wMjdsLTAuMDI3LDAuMzgzbC0wLjM4NS0wLjAyN2wtMC4wMjYsMC4zODRsLTAuMDQ0LDAuMzgzbDAuMzMxLDAuNzk0bC0wLjAyNiwwLjM4M2wtMC4wNTQsMC43NjdsLTAuMDI2LDAuMzgzbC0wLjA3MSwwLjc4M2wtMC40MTEsMC4zNTdsLTAuMDI2LDAuMzgzbC0wLjQxMSwwLjM1N2wtMC40MTIsMC4zNTZsLTIuMDcyLDEuNzY3bC0wLjQyOSwwLjM1NmwtMC40MTEsMC4zNTdsLTAuNDExLDAuMzU3bC0wLjQxMSwwLjM1NmwtMC40ODIsMS4xMjNsLTAuMDI2LDAuMzg0bC0wLjQ2NSwxLjEyNGwtMC43NDItMC40MzdsLTMuNzgyLTEuNDM2bC0yLjU5MiwzLjY3NGwtMy4wOSw0Ljc5NmwtMi41MzgsMi45MDdsLTAuOTc0LDIuNjNsLTEuNzE2LDIuMTkzbC0wLjUwOSwxLjUwN2wtMC40MTEsMC4zNTZsLTEuMzMxLDIuMjJsMS40NTgsMS4yNzRsLTAuNDM4LDAuNzRsMC42NzIsMS4yMDNsLTAuMDI2LDAuMzg0bC0wLjQzOCwwLjc1N2wtMC4wMjcsMC4zODNsLTAuNDExLDAuMzU3bC0wLjQ4MSwxLjEyM2wwLjc2OSwwLjA1NGwxLjEwMSwwLjg0N2wxLjUxMSwwLjUwN2wtMS45MDEsOS45MjJsLTAuMDk3LDEuMTVsLTAuMDU0LDAuNzY3bDAuMzMxLDAuNzkzbC0xLjMzMSwyLjIzN2wtMS41NjUsMC4yNmwtMS4xOTcsMC4zMDNsLTIuODE0LDEuMzI5bC0wLjEwOCwxLjU1MWwtMC4wNywwLjc2N2wtMC4wMjYsMC4zODNsMC4zNTcsMC40MWwwLjM1OCwwLjQxMWwxLjEyNiwwLjQ4bDAuMzg1LDAuMDI3bDAuNzcsMC4wNTNsMC4zNTcsMC40MWwwLjc0MiwwLjQ1NGwwLjcxNSwwLjgybC0wLjAyNiwwLjM4M2wwLjcxNiwwLjgyMWwwLjM1NywwLjQyN2wtMC4wMjcsMC4zODRsLTAuMDI2LDAuMzgzbC0wLjM4NS0wLjAyN2wtMC4wMjYsMC4zODNsLTAuODEzLDAuMzNsLTAuMzg0LTAuMDI3bC0wLjAyNywwLjM4NGwtMC4zODQtMC4wNDNsLTAuNDExLDAuMzU2bC0wLjQxMSwwLjM1N2wtMC4wNDQsMC4zODNsLTAuMzg1LTAuMDI2bC0wLjAyNiwwLjM4M2wtMC4zODUtMC4wMjdsLTAuNDExLDAuMzU2bC0wLjAyNywwLjM4NGwtMC4wMjYsMC4zODNsMC4zODUsMC4wMjdsLTAuMDI3LDAuNGwwLjM1NywwLjQxbDAuMjg4LDEuMTc3bC0wLjAyNywwLjM4M2wtMC40MTEsMC4zNTdsLTAuNDExLDAuMzU2bC0wLjAyNywwLjM4NGwtMC40MDEtMC4wMjdsLTAuNDM4LDAuNzRsLTAuNzk2LDAuMzNsLTAuNDExLDAuMzU3bC0wLjQ1NSwwLjc0bC0wLjAyNiwwLjM4M2wtMC40MzgsMC43NGwtMC40MTEsMC4zNTdsLTAuODEyLDAuMzNsLTAuNDExLDAuMzU2bDAuNjg4LDEuMjA0bDAuNzQyLDAuNDU0bC0wLjAyNywwLjM4M2wxLjQzMiwxLjY0MWwxLjYxLDQuMzg1bDAuMzE0LDAuNzkzbDEuOTQxLDUuMTc5bC0wLjg1LDEuMDk3bDIuMTI5LDIuNDc4bC0wLjQxMSwwLjM1NmwtNC42MzEtMC4zMzhsLTEuNjM1LDEuMDI2bC0wLjQxMSwwLjM1NmwtMS4yMzQsMS4wN2wtMC44MzksMC43MTNsLTEuMjM0LDEuMDdsLTAuNDI4LDAuMzU2bC0wLjQzOCwwLjc0bC0wLjc5NiwwLjMzbC0xLjQ4NC0wLjg5MWwtMC43NDItMC40MzhsLTEuNDg0LTAuODkxbC0wLjcxNi0wLjgybC0wLjc2OS0wLjA3bC0wLjUwOSwxLjUyM2wtMi44MTIsNi4zNTZsLTEuMTMxLDIuNzg3IE0yMzQuNTkyLDIzOS41NGwtMC4wNTgsMC43N2wtMC4xMTYsMS41MzlsLTEuMjE2LDAuNjgzbC0xLjIxNSwwLjY4M2wtMS42MDIsMC42NTNsLTEuMjE1LDAuNjgzbC0xLjYzMSwxLjAzOWwtMi4wMTYsMS4wMDlsLTAuODMsMC43MTJsLTIuMDE2LDEuMDA5bC0wLjQxNSwwLjM1NmwtMS4yMTUsMC42ODNsLTAuNDE1LDAuMzU1bC0wLjQxNSwwLjM1NmwtMC40MTUsMC4zNTZsLTEuMTg2LDAuMjk4bC0xLjIxNiwwLjY4M2wtMC44MDEsMC4zMjdsLTAuNDE0LDAuMzU2bDAuMzI3LDAuNzk4bDAuMzU3LDAuNDE0bDAuMjk5LDEuMTg0bDAuMzU2LDAuNDE0bDAuMzU2LDAuNDE0bDAuNzQzLDAuNDQzbDAuMzU2LDAuNDE0bC0wLjAyOCwwLjM4NWwtMC4wODcsMS4xNTRsMC4zMjcsMC43OThsLTAuMDI4LDAuMzg1bDEuMDcsMS4yNDFsMC4zNTYsMC40MTRsLTAuMDI4LDAuMzg1bC0wLjAyOSwwLjM4NWwwLjI5OSwxLjE4NGwwLjM4NiwwLjAyOWwwLjM1NywwLjQxNGwwLjM1NiwwLjQxNGwwLjM4NiwwLjAyOWwtMC4wNTgsMC43N2wtMC4wNTgsMC43N2wwLjM4NiwwLjAyOWwtMC4wMjksMC4zODVsMC4zNTcsMC40MTRsMC4zMjcsMC43OThsMC4zMjgsMC43OTlsMC4zNTYsMC40MTRsMC4zNTcsMC40MTRsMC4zNTYsMC40MTRsLTAuMDI4LDAuMzg1bDAuMzI3LDAuNzk4bC0wLjQ3MywxLjEyNWwwLjI3MSwxLjU2OGwtMC4wMjksMC4zODVsMC4zNTYsMC40MTRsMC4zNTcsMC40MTRsMC4zODYsMC4wMjlsMC43MTQsMC44MjdsMC4zNTYsMC40MTRsLTAuMDU5LDAuNzdsMC4zODcsMC4wMjlsMC4yOTksMS4xODNsLTAuMDI5LDAuMzg1bC0wLjAyOCwwLjM4NWwwLjcxMywwLjgyOGwwLjM1NywwLjQxNGwtMC4wMjksMC4zODVsMC4zMjgsMC43OThsLTAuMDI5LDAuMzg1bC0wLjA4NywxLjE1NGwtMC4wMjgsMC4zODVsLTAuMDU4LDAuNzdsLTAuMDU5LDAuNzdsLTAuNDQzLDAuNzQxbC0wLjQxNSwwLjM1NWwtMC4wNTksMC43N2wtMC4wMjgsMC4zODVsLTAuMDI5LDAuMzg1bC0wLjAyOSwwLjM4NWwtMC4wMjgsMC4zODVsLTAuMDI5LDAuMzg1bC0wLjAyOCwwLjM4NWwtMC40MTUsMC4zNTZsLTAuMDI5LDAuMzg1bDAuMjk5LDEuMTgzbC0wLjA1OCwwLjc3bDAuODI5LTAuNzExbDEuMTg3LTAuMjk4bDAuODAxLTAuMzI3bDAuODAxLTAuMzI3bDAuNDE1LTAuMzU2bDAuOC0wLjMyN2wwLjM4NiwwLjAyOWwwLjc0MywwLjQ0M2wxLjQ1NiwxLjI3bDAuMzg2LDAuMDI5bDEuMSwwLjg1NmwwLjc0MywwLjQ0M2wwLjQ3My0xLjEyNWwyLjMwNi00Ljg1N2wtMC4zMjgtMC43OThsMC43NzEsMC4wNThsMS4yMTYtMC42ODNsMS41NzItMC4yNjlsOC40MjEtMy42MjRsMS41NzEtMC4yNjlsMC44MDEtMC4zMjdsNC40MTgtMS45OWwxLjE1NywwLjA4N2wxLjU0NCwwLjExNmwzLjUwMS0wLjEyNGwzLjExNS0wLjE1M2wzLjg4Ny0wLjA5NWwzLjg4OC0wLjA5NWwyLjcyOS0wLjE4MmwxLjU0MywwLjExNmwwLjcwNS00LjIwM2wwLjQ0My0wLjc0MWwwLjAyOS0wLjM4NWwwLjgwMS0wLjMyN2wxLjE4Ny0wLjI5OGwxLjE4Ni0wLjI5OGwxLjk4Ny0wLjYyNWwyLjM3My0wLjU5NmwwLjM4NiwwLjAyOWwwLjQxNS0wLjM1NWwxLjU3Mi0wLjI2OWwyLjAxNi0xLjAwOWwxLjYwNC0wLjc1M2wyLjkxMiwyLjU0MVxcXCIvPlxcblx0XHQ8L3N2Zz5cXG5cXG5cdDwvZGl2Plx0XFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGlkPSdwYWdlcy1jb250YWluZXInPlxcblx0PGRpdiBpZD0ncGFnZS1hJz48L2Rpdj5cXG5cdDxkaXYgaWQ9J3BhZ2UtYic+PC9kaXY+XFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsImltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG4gICAgXHRcbmNsYXNzIEdsb2JhbEV2ZW50cyB7XG5cdGluaXQoKSB7XG5cdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCB0aGlzLnJlc2l6ZSlcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0QXBwQWN0aW9ucy53aW5kb3dSZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBHbG9iYWxFdmVudHNcbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcblxuY2xhc3MgUHJlbG9hZGVyICB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMucXVldWUgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlKGZhbHNlKVxuXHRcdHRoaXMucXVldWUub24oXCJjb21wbGV0ZVwiLCB0aGlzLm9uTWFuaWZlc3RMb2FkQ29tcGxldGVkLCB0aGlzKVxuXHRcdHRoaXMuY3VycmVudExvYWRlZENhbGxiYWNrID0gdW5kZWZpbmVkXG5cdFx0dGhpcy5hbGxNYW5pZmVzdHMgPSBbXVxuXHR9XG5cdGxvYWQobWFuaWZlc3QsIG9uTG9hZGVkKSB7XG5cblx0XHRpZih0aGlzLmFsbE1hbmlmZXN0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYWxsTWFuaWZlc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBtID0gdGhpcy5hbGxNYW5pZmVzdHNbaV1cblx0XHRcdFx0aWYobS5sZW5ndGggPT0gbWFuaWZlc3QubGVuZ3RoICYmIG1bMF0uaWQgPT0gbWFuaWZlc3RbMF0uaWQgJiYgbVttLmxlbmd0aC0xXS5pZCA9PSBtYW5pZmVzdFttYW5pZmVzdC5sZW5ndGgtMV0uaWQpIHtcblx0XHRcdFx0XHRvbkxvYWRlZCgpXHRcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHR0aGlzLmFsbE1hbmlmZXN0cy5wdXNoKG1hbmlmZXN0KVxuXHRcdHRoaXMuY3VycmVudExvYWRlZENhbGxiYWNrID0gb25Mb2FkZWRcbiAgICAgICAgdGhpcy5xdWV1ZS5sb2FkTWFuaWZlc3QobWFuaWZlc3QpXG5cdH1cblx0b25NYW5pZmVzdExvYWRDb21wbGV0ZWQoKSB7XG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2soKVxuXHR9XG5cdGdldENvbnRlbnRCeUlkKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMucXVldWUuZ2V0UmVzdWx0KGlkKVxuXHR9XG5cdGdldEltYWdlVVJMKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0Q29udGVudEJ5SWQoaWQpLmdldEF0dHJpYnV0ZShcInNyY1wiKVxuXHR9XG5cdGdldEltYWdlU2l6ZShpZCkge1xuXHRcdHZhciBjb250ZW50ID0gdGhpcy5nZXRDb250ZW50QnlJZChpZClcblx0XHRyZXR1cm4geyB3aWR0aDogY29udGVudC53aWR0aCwgaGVpZ2h0OiBjb250ZW50LmhlaWdodCB9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJlbG9hZGVyXG4iLCJpbXBvcnQgaGFzaGVyIGZyb20gJ2hhc2hlcidcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgY3Jvc3Nyb2FkcyBmcm9tICdjcm9zc3JvYWRzJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IGRhdGEgZnJvbSAnR2xvYmFsRGF0YSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG5jbGFzcyBSb3V0ZXIge1xuXHRpbml0KCkge1xuXHRcdHRoaXMucm91dGluZyA9IGRhdGEucm91dGluZ1xuXHRcdHRoaXMubmV3SGFzaEZvdW5kZWQgPSBmYWxzZVxuXHRcdGhhc2hlci5uZXdIYXNoID0gdW5kZWZpbmVkXG5cdFx0aGFzaGVyLm9sZEhhc2ggPSB1bmRlZmluZWRcblx0XHRoYXNoZXIuaW5pdGlhbGl6ZWQuYWRkKHRoaXMuX2RpZEhhc2hlckNoYW5nZS5iaW5kKHRoaXMpKVxuXHRcdGhhc2hlci5jaGFuZ2VkLmFkZCh0aGlzLl9kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHR0aGlzLl9zZXR1cENyb3Nzcm9hZHMoKVxuXHR9XG5cdGJlZ2luUm91dGluZygpIHtcblx0XHRoYXNoZXIuaW5pdCgpXG5cdH1cblx0X3NldHVwQ3Jvc3Nyb2FkcygpIHtcblx0IFx0dmFyIHJvdXRlcyA9IHRoaXMucm91dGluZ1xuXHRcdGZvcih2YXIga2V5IGluIHJvdXRlcykge1xuXHRcdFx0aWYoa2V5Lmxlbmd0aCA+IDEpIHtcblx0ICAgIFx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKGtleSwgdGhpcy5fb25QYXJzZVVybC5iaW5kKHRoaXMpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKCcnLCB0aGlzLl9vblBhcnNlVXJsLmJpbmQodGhpcykpXG5cdH1cblx0X29uUGFyc2VVcmwoKSB7XG5cdFx0dGhpcy5fYXNzaWduUm91dGUoKVxuXHR9XG5cdF9vbkRlZmF1bHRVUkxIYW5kbGVyKCkge1xuXHRcdHRoaXMuX3NlbmRUb0RlZmF1bHQoKVxuXHR9XG5cdF9hc3NpZ25Sb3V0ZShpZCkge1xuXHRcdHZhciBoYXNoID0gaGFzaGVyLmdldEhhc2goKVxuXHRcdHZhciBwYXJ0cyA9IHRoaXMuX2dldFVSTFBhcnRzKGhhc2gpXG5cdFx0dGhpcy5fdXBkYXRlUGFnZVJvdXRlKGhhc2gsIHBhcnRzLCBwYXJ0c1swXSwgKHBhcnRzWzFdID09IHVuZGVmaW5lZCkgPyAnJyA6IHBhcnRzWzFdKVxuXHRcdHRoaXMubmV3SGFzaEZvdW5kZWQgPSB0cnVlXG5cdH1cblx0X2dldFVSTFBhcnRzKHVybCkge1xuXHRcdHZhciBoYXNoID0gdXJsXG5cdFx0cmV0dXJuIGhhc2guc3BsaXQoJy8nKVxuXHR9XG5cdF91cGRhdGVQYWdlUm91dGUoaGFzaCwgcGFydHMsIHBhcmVudCwgdGFyZ2V0KSB7XG5cdFx0aGFzaGVyLm9sZEhhc2ggPSBoYXNoZXIubmV3SGFzaFxuXHRcdGhhc2hlci5uZXdIYXNoID0ge1xuXHRcdFx0aGFzaDogaGFzaCxcblx0XHRcdHBhcnRzOiBwYXJ0cyxcblx0XHRcdHBhcmVudDogcGFyZW50LFxuXHRcdFx0dGFyZ2V0OiB0YXJnZXRcblx0XHR9XG5cdFx0aGFzaGVyLm5ld0hhc2gudHlwZSA9IGhhc2hlci5uZXdIYXNoLmhhc2ggPT0gJycgPyBBcHBDb25zdGFudHMuSE9NRSA6IEFwcENvbnN0YW50cy5ESVBUWVFVRVxuXHRcdEFwcEFjdGlvbnMucGFnZUhhc2hlckNoYW5nZWQoKVxuXHR9XG5cdF9kaWRIYXNoZXJDaGFuZ2UobmV3SGFzaCwgb2xkSGFzaCkge1xuXHRcdHRoaXMubmV3SGFzaEZvdW5kZWQgPSBmYWxzZVxuXHRcdGNyb3Nzcm9hZHMucGFyc2UobmV3SGFzaClcblx0XHRpZih0aGlzLm5ld0hhc2hGb3VuZGVkKSByZXR1cm5cblx0XHQvLyBJZiBVUkwgZG9uJ3QgbWF0Y2ggYSBwYXR0ZXJuLCBzZW5kIHRvIGRlZmF1bHRcblx0XHR0aGlzLl9vbkRlZmF1bHRVUkxIYW5kbGVyKClcblx0fVxuXHRfc2VuZFRvRGVmYXVsdCgpIHtcblx0XHRoYXNoZXIuc2V0SGFzaChBcHBTdG9yZS5kZWZhdWx0Um91dGUoKSlcblx0fVxuXHRzdGF0aWMgZ2V0QmFzZVVSTCgpIHtcblx0XHRyZXR1cm4gZG9jdW1lbnQuVVJMLnNwbGl0KFwiI1wiKVswXVxuXHR9XG5cdHN0YXRpYyBnZXRIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIuZ2V0SGFzaCgpXG5cdH1cblx0c3RhdGljIGdldFJvdXRlcygpIHtcblx0XHRyZXR1cm4gQXBwU3RvcmUuRGF0YS5yb3V0aW5nXG5cdH1cblx0c3RhdGljIGdldE5ld0hhc2goKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5uZXdIYXNoXG5cdH1cblx0c3RhdGljIGdldE9sZEhhc2goKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5vbGRIYXNoXG5cdH1cblx0c3RhdGljIHNldEhhc2goaGFzaCkge1xuXHRcdGhhc2hlci5zZXRIYXNoKGhhc2gpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm91dGVyXG4iLCJpbXBvcnQgQXBwRGlzcGF0Y2hlciBmcm9tICdBcHBEaXNwYXRjaGVyJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQge0V2ZW50RW1pdHRlcjJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjInXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5pbXBvcnQgZGF0YSBmcm9tICdHbG9iYWxEYXRhJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmZ1bmN0aW9uIF9nZXRDb250ZW50U2NvcGUoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgcmV0dXJuIEFwcFN0b3JlLmdldFJvdXRlUGF0aFNjb3BlQnlJZChoYXNoT2JqLmhhc2gpXG59XG5mdW5jdGlvbiBfZ2V0UGFnZUFzc2V0c1RvTG9hZCgpIHtcbiAgICB2YXIgc2NvcGUgPSBfZ2V0Q29udGVudFNjb3BlKClcbiAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICB2YXIgdHlwZSA9IF9nZXRUeXBlT2ZQYWdlKClcbiAgICB2YXIgbWFuaWZlc3Q7XG5cbiAgICBpZih0eXBlICE9IEFwcENvbnN0YW50cy5IT01FKSB7XG4gICAgICAgIHZhciBmaWxlbmFtZXMgPSBbXG4gICAgICAgICAgICAnY2hhcmFjdGVyLnBuZycsXG4gICAgICAgICAgICAnY2hhcmFjdGVyLWJnLmpwZycsXG4gICAgICAgICAgICAnc2hvZS5wbmcnLFxuICAgICAgICAgICAgJ3Nob2UtYmcuanBnJ1xuICAgICAgICBdXG4gICAgICAgIG1hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhmaWxlbmFtZXMsIGhhc2hPYmoucGFyZW50LCBoYXNoT2JqLnRhcmdldCwgdHlwZSlcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlIG9mIGV4dHJhIGFzc2V0c1xuICAgIGlmKHNjb3BlLmFzc2V0cyAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIGFzc2V0cyA9IHNjb3BlLmFzc2V0c1xuICAgICAgICB2YXIgYXNzZXRzTWFuaWZlc3Q7XG4gICAgICAgIGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUpIHtcbiAgICAgICAgICAgIGFzc2V0c01hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhhc3NldHMsICdob21lJywgaGFzaE9iai50YXJnZXQsIHR5cGUpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgYXNzZXRzTWFuaWZlc3QgPSBfYWRkQmFzZVBhdGhzVG9VcmxzKGFzc2V0cywgaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0LCB0eXBlKSAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBtYW5pZmVzdCA9IChtYW5pZmVzdCA9PSB1bmRlZmluZWQpID8gYXNzZXRzTWFuaWZlc3QgOiBtYW5pZmVzdC5jb25jYXQoYXNzZXRzTWFuaWZlc3QpXG4gICAgfVxuXG4gICAgcmV0dXJuIG1hbmlmZXN0XG59XG5mdW5jdGlvbiBfYWRkQmFzZVBhdGhzVG9VcmxzKHVybHMsIHBhZ2VJZCwgdGFyZ2V0SWQsIHR5cGUpIHtcbiAgICB2YXIgYmFzZVBhdGggPSAodHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSkgPyBfZ2V0SG9tZVBhZ2VBc3NldHNCYXNlUGF0aCgpIDogX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQocGFnZUlkLCB0YXJnZXRJZClcbiAgICB2YXIgbWFuaWZlc3QgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc3BsaXR0ZXIgPSB1cmxzW2ldLnNwbGl0KCcuJylcbiAgICAgICAgdmFyIGZpbGVOYW1lID0gc3BsaXR0ZXJbMF1cbiAgICAgICAgdmFyIGV4dGVuc2lvbiA9IHNwbGl0dGVyWzFdXG4gICAgICAgIHZhciBpZCA9IHBhZ2VJZCArICctJ1xuICAgICAgICBpZih0YXJnZXRJZCkgaWQgKz0gdGFyZ2V0SWQgKyAnLSdcbiAgICAgICAgaWQgKz0gZmlsZU5hbWVcbiAgICAgICAgbWFuaWZlc3RbaV0gPSB7XG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICBzcmM6IGJhc2VQYXRoICsgZmlsZU5hbWUgKyBfZ2V0SW1hZ2VFeHRlbnNpb25CeURldmljZVJhdGlvKCkgKyAnLicgKyBleHRlbnNpb25cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFuaWZlc3Rcbn1cbmZ1bmN0aW9uIF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKGlkLCBhc3NldEdyb3VwSWQpIHtcbiAgICByZXR1cm4gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL2RpcHR5cXVlLycgKyBpZCArICcvJyArIGFzc2V0R3JvdXBJZCArICcvJ1xufVxuZnVuY3Rpb24gX2dldEhvbWVQYWdlQXNzZXRzQmFzZVBhdGgoKSB7XG4gICAgcmV0dXJuIEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9ob21lLydcbn1cbmZ1bmN0aW9uIF9nZXRJbWFnZUV4dGVuc2lvbkJ5RGV2aWNlUmF0aW8oKSB7XG4gICAgLy8gcmV0dXJuICdAJyArIF9nZXREZXZpY2VSYXRpbygpICsgJ3gnXG4gICAgcmV0dXJuICcnXG59XG5mdW5jdGlvbiBfZ2V0RGV2aWNlUmF0aW8oKSB7XG4gICAgdmFyIHNjYWxlID0gKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID09IHVuZGVmaW5lZCkgPyAxIDogd2luZG93LmRldmljZVBpeGVsUmF0aW9cbiAgICByZXR1cm4gKHNjYWxlID4gMSkgPyAyIDogMVxufVxuZnVuY3Rpb24gX2dldFR5cGVPZlBhZ2UoaGFzaCkge1xuICAgIHZhciBoID0gaGFzaCB8fCBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgaWYoaC5wYXJ0cy5sZW5ndGggPT0gMikgcmV0dXJuIEFwcENvbnN0YW50cy5ESVBUWVFVRVxuICAgIGVsc2UgcmV0dXJuIEFwcENvbnN0YW50cy5IT01FXG59XG5mdW5jdGlvbiBfZ2V0UGFnZUNvbnRlbnQoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIGhhc2ggPSBoYXNoT2JqLmhhc2gubGVuZ3RoIDwgMSA/ICcvJyA6IGhhc2hPYmouaGFzaFxuICAgIHZhciBjb250ZW50ID0gZGF0YS5yb3V0aW5nW2hhc2hdXG4gICAgcmV0dXJuIGNvbnRlbnRcbn1cbmZ1bmN0aW9uIF9nZXRDb250ZW50QnlMYW5nKGxhbmcpIHtcbiAgICByZXR1cm4gZGF0YS5jb250ZW50LmxhbmdbbGFuZ11cbn1cbmZ1bmN0aW9uIF9nZXRHbG9iYWxDb250ZW50KCkge1xuICAgIHJldHVybiBfZ2V0Q29udGVudEJ5TGFuZyhBcHBTdG9yZS5sYW5nKCkpXG59XG5mdW5jdGlvbiBfZ2V0QXBwRGF0YSgpIHtcbiAgICByZXR1cm4gZGF0YVxufVxuZnVuY3Rpb24gX2dldERlZmF1bHRSb3V0ZSgpIHtcbiAgICByZXR1cm4gZGF0YVsnZGVmYXVsdC1yb3V0ZSddXG59XG5mdW5jdGlvbiBfd2luZG93V2lkdGhIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdzogd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgIGg6IHdpbmRvdy5pbm5lckhlaWdodFxuICAgIH1cbn1cbmZ1bmN0aW9uIF9nZXREaXB0eXF1ZVNob2VzKCkge1xuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHZhciBiYXNldXJsID0gX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQoaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0KVxuICAgIHZhciBzaG9lcyA9IF9nZXRDb250ZW50U2NvcGUoKS5zaG9lc1xuICAgIHZhciB1cmxzID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNob2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBmaWxlbmFtZSA9IHNob2VzW2ldXG4gICAgICAgIHZhciBwYXRoID0gYmFzZXVybCArICdzaG9lcy8nICsgZmlsZW5hbWVcbiAgICAgICAgdXJsc1tpXSA9IHBhdGhcbiAgICB9O1xuICAgIHJldHVybiB1cmxzXG59XG5cbnZhciBBcHBTdG9yZSA9IGFzc2lnbih7fSwgRXZlbnRFbWl0dGVyMi5wcm90b3R5cGUsIHtcbiAgICBlbWl0Q2hhbmdlOiBmdW5jdGlvbih0eXBlLCBpdGVtKSB7XG4gICAgICAgIHRoaXMuZW1pdCh0eXBlLCBpdGVtKVxuICAgIH0sXG4gICAgcGFnZUNvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldFBhZ2VDb250ZW50KClcbiAgICB9LFxuICAgIGFwcERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldEFwcERhdGEoKVxuICAgIH0sXG4gICAgZGVmYXVsdFJvdXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXREZWZhdWx0Um91dGUoKVxuICAgIH0sXG4gICAgZ2xvYmFsQ29udGVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0R2xvYmFsQ29udGVudCgpXG4gICAgfSxcbiAgICBwYWdlQXNzZXRzVG9Mb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRQYWdlQXNzZXRzVG9Mb2FkKClcbiAgICB9LFxuICAgIGdldFJvdXRlUGF0aFNjb3BlQnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgaWQgPSBpZC5sZW5ndGggPCAxID8gJy8nIDogaWRcbiAgICAgICAgcmV0dXJuIGRhdGEucm91dGluZ1tpZF1cbiAgICB9LFxuICAgIGJhc2VNZWRpYVBhdGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQXBwU3RvcmUuZ2V0RW52aXJvbm1lbnQoKS5zdGF0aWNcbiAgICB9LFxuICAgIGdldEVudmlyb25tZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEFwcENvbnN0YW50cy5FTlZJUk9OTUVOVFNbRU5WXVxuICAgIH0sXG4gICAgZ2V0VHlwZU9mUGFnZTogZnVuY3Rpb24oaGFzaCkge1xuICAgICAgICByZXR1cm4gX2dldFR5cGVPZlBhZ2UoaGFzaClcbiAgICB9LFxuICAgIGdldEhvbWVWaWRlb3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGF0YVsnaG9tZS12aWRlb3MnXVxuICAgIH0sXG4gICAgZ2VuZXJhbEluZm9zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuY29udGVudFxuICAgIH0sXG4gICAgZGlwdHlxdWVTaG9lczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0RGlwdHlxdWVTaG9lcygpXG4gICAgfSxcbiAgICBsYW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRMYW5nID0gdHJ1ZVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGFuZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBsYW5nID0gZGF0YS5sYW5nc1tpXVxuICAgICAgICAgICAgaWYobGFuZyA9PSBKU19sYW5nKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdExhbmcgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gKGRlZmF1bHRMYW5nID09IHRydWUpID8gJ2VuJyA6IEpTX2xhbmdcbiAgICB9LFxuICAgIFdpbmRvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfd2luZG93V2lkdGhIZWlnaHQoKVxuICAgIH0sXG4gICAgYWRkUFhDaGlsZDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBBcHBTdG9yZS5QWENvbnRhaW5lci5hZGQoaXRlbS5jaGlsZClcbiAgICB9LFxuICAgIHJlbW92ZVBYQ2hpbGQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgQXBwU3RvcmUuUFhDb250YWluZXIucmVtb3ZlKGl0ZW0uY2hpbGQpXG4gICAgfSxcbiAgICBQYXJlbnQ6IHVuZGVmaW5lZCxcbiAgICBDYW52YXM6IHVuZGVmaW5lZCxcbiAgICBPcmllbnRhdGlvbjogQXBwQ29uc3RhbnRzLkxBTkRTQ0FQRSxcbiAgICBEZXRlY3Rvcjoge1xuICAgICAgICBpc01vYmlsZTogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBkaXNwYXRjaGVySW5kZXg6IEFwcERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCl7XG4gICAgICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvblxuICAgICAgICBzd2l0Y2goYWN0aW9uLmFjdGlvblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkU6XG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuV2luZG93LncgPSBhY3Rpb24uaXRlbS53aW5kb3dXXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuV2luZG93LmggPSBhY3Rpb24uaXRlbS53aW5kb3dIXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuT3JpZW50YXRpb24gPSAoQXBwU3RvcmUuV2luZG93LncgPiBBcHBTdG9yZS5XaW5kb3cuaCkgPyBBcHBDb25zdGFudHMuTEFORFNDQVBFIDogQXBwQ29uc3RhbnRzLlBPUlRSQUlUXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuZW1pdENoYW5nZShhY3Rpb24uYWN0aW9uVHlwZSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBBcHBTdG9yZS5lbWl0Q2hhbmdlKGFjdGlvbi5hY3Rpb25UeXBlLCBhY3Rpb24uaXRlbSkgXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG59KVxuXG5cbmV4cG9ydCBkZWZhdWx0IEFwcFN0b3JlXG5cbiIsImltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG52YXIgUHhIZWxwZXIgPSB7XG5cbiAgICBnZXRQWFZpZGVvOiBmdW5jdGlvbih1cmwsIHdpZHRoLCBoZWlnaHQsIHZhcnMpIHtcbiAgICAgICAgdmFyIHRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbVZpZGVvKHVybClcbiAgICAgICAgdGV4dHVyZS5iYXNlVGV4dHVyZS5zb3VyY2Uuc2V0QXR0cmlidXRlKFwibG9vcFwiLCB0cnVlKVxuICAgICAgICB2YXIgdmlkZW9TcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGV4dHVyZSlcbiAgICAgICAgdmlkZW9TcHJpdGUud2lkdGggPSB3aWR0aFxuICAgICAgICB2aWRlb1Nwcml0ZS5oZWlnaHQgPSBoZWlnaHRcbiAgICAgICAgcmV0dXJuIHZpZGVvU3ByaXRlXG4gICAgfSxcblxuICAgIHJlbW92ZUNoaWxkcmVuRnJvbUNvbnRhaW5lcjogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IGNvbnRhaW5lci5jaGlsZHJlblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNoaWxkKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRGcmFtZUltYWdlc0FycmF5OiBmdW5jdGlvbihmcmFtZXMsIGJhc2V1cmwsIGV4dCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBbXVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBmcmFtZXM7IGkrKykge1xuICAgICAgICAgICAgdmFyIHVybCA9IGJhc2V1cmwgKyBpICsgJy4nICsgZXh0XG4gICAgICAgICAgICBhcnJheVtpXSA9IHVybFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYXJyYXlcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHhIZWxwZXIiLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxuY2xhc3MgVXRpbHMge1xuXHRzdGF0aWMgTm9ybWFsaXplTW91c2VDb29yZHMoZSwgb2JqV3JhcHBlcikge1xuXHRcdHZhciBwb3N4ID0gMDtcblx0XHR2YXIgcG9zeSA9IDA7XG5cdFx0aWYgKCFlKSB2YXIgZSA9IHdpbmRvdy5ldmVudDtcblx0XHRpZiAoZS5wYWdlWCB8fCBlLnBhZ2VZKSBcdHtcblx0XHRcdHBvc3ggPSBlLnBhZ2VYO1xuXHRcdFx0cG9zeSA9IGUucGFnZVk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGUuY2xpZW50WCB8fCBlLmNsaWVudFkpIFx0e1xuXHRcdFx0cG9zeCA9IGUuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuXHRcdFx0XHQrIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuXHRcdFx0cG9zeSA9IGUuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG5cdFx0XHRcdCsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblx0XHR9XG5cdFx0b2JqV3JhcHBlci54ID0gcG9zeFxuXHRcdG9ialdyYXBwZXIueSA9IHBvc3lcblx0XHRyZXR1cm4gb2JqV3JhcHBlclxuXHR9XG5cdHN0YXRpYyBSZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHdpbmRvd1csIHdpbmRvd0gsIGNvbnRlbnRXLCBjb250ZW50SCwgb3JpZW50YXRpb24pIHtcblx0XHR2YXIgYXNwZWN0UmF0aW8gPSBjb250ZW50VyAvIGNvbnRlbnRIXG5cdFx0aWYob3JpZW50YXRpb24gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYob3JpZW50YXRpb24gPT0gQXBwQ29uc3RhbnRzLkxBTkRTQ0FQRSkge1xuXHRcdFx0XHR2YXIgc2NhbGUgPSAod2luZG93VyAvIGNvbnRlbnRXKSAqIDFcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgc2NhbGUgPSAod2luZG93SCAvIGNvbnRlbnRIKSAqIDFcblx0XHRcdH1cblx0XHR9ZWxzZXtcblx0XHRcdHZhciBzY2FsZSA9ICgod2luZG93VyAvIHdpbmRvd0gpIDwgYXNwZWN0UmF0aW8pID8gKHdpbmRvd0ggLyBjb250ZW50SCkgKiAxIDogKHdpbmRvd1cgLyBjb250ZW50VykgKiAxXG5cdFx0fVxuXHRcdHZhciBuZXdXID0gY29udGVudFcgKiBzY2FsZVxuXHRcdHZhciBuZXdIID0gY29udGVudEggKiBzY2FsZVxuXHRcdHZhciBjc3MgPSB7XG5cdFx0XHR3aWR0aDogbmV3Vyxcblx0XHRcdGhlaWdodDogbmV3SCxcblx0XHRcdGxlZnQ6ICh3aW5kb3dXID4+IDEpIC0gKG5ld1cgPj4gMSksXG5cdFx0XHR0b3A6ICh3aW5kb3dIID4+IDEpIC0gKG5ld0ggPj4gMSksXG5cdFx0XHRzY2FsZTogc2NhbGVcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGNzc1xuXHR9XG5cdHN0YXRpYyBDYXBpdGFsaXplRmlyc3RMZXR0ZXIoc3RyaW5nKSB7XG5cdCAgICByZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpO1xuXHR9XG5cdHN0YXRpYyBTdXBwb3J0V2ViR0woKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuXHRcdFx0cmV0dXJuICEhICggd2luZG93LldlYkdMUmVuZGVyaW5nQ29udGV4dCAmJiAoIGNhbnZhcy5nZXRDb250ZXh0KCAnd2ViZ2wnICkgfHwgY2FudmFzLmdldENvbnRleHQoICdleHBlcmltZW50YWwtd2ViZ2wnICkgKSApO1xuXHRcdH0gY2F0Y2ggKCBlICkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRzdGF0aWMgRGVzdHJveVZpZGVvKHZpZGVvKSB7XG4gICAgICAgIHZpZGVvLnBhdXNlKCk7XG4gICAgICAgIHZpZGVvLnNyYyA9ICcnO1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB2aWRlby5jaGlsZE5vZGVzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgXHR2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICBcdGNoaWxkLnNldEF0dHJpYnV0ZSgnc3JjJywgJycpO1xuICAgICAgICBcdC8vIFdvcmtpbmcgd2l0aCBhIHBvbHlmaWxsIG9yIHVzZSBqcXVlcnlcbiAgICAgICAgXHQkKGNoaWxkKS5yZW1vdmUoKVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBEZXN0cm95VmlkZW9UZXh0dXJlKHRleHR1cmUpIHtcbiAgICBcdHZhciB2aWRlbyA9IHRleHR1cmUuYmFzZVRleHR1cmUuc291cmNlXG4gICAgICAgIFV0aWxzLkRlc3Ryb3lWaWRlbyh2aWRlbylcbiAgICB9XG4gICAgc3RhdGljIFJhbmQobWluLCBtYXgsIGRlY2ltYWxzKSB7XG4gICAgICAgIHZhciByYW5kb21OdW0gPSBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW5cbiAgICAgICAgaWYoZGVjaW1hbHMgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIFx0cmV0dXJuIHJhbmRvbU51bVxuICAgICAgICB9ZWxzZXtcblx0ICAgICAgICB2YXIgZCA9IE1hdGgucG93KDEwLCBkZWNpbWFscylcblx0ICAgICAgICByZXR1cm4gfn4oKGQgKiByYW5kb21OdW0pICsgMC41KSAvIGRcbiAgICAgICAgfVxuXHR9XG5cdHN0YXRpYyBHZXRJbWdVcmxJZCh1cmwpIHtcblx0XHR2YXIgc3BsaXQgPSB1cmwuc3BsaXQoJy8nKVxuXHRcdHJldHVybiBzcGxpdFtzcGxpdC5sZW5ndGgtMV0uc3BsaXQoJy4nKVswXVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxzXG4iLCIvLyBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xuLy8gaHR0cDovL215Lm9wZXJhLmNvbS9lbW9sbGVyL2Jsb2cvMjAxMS8xMi8yMC9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWVyLWFuaW1hdGluZ1xuIFxuLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsIGJ5IEVyaWsgTcO2bGxlci4gZml4ZXMgZnJvbSBQYXVsIElyaXNoIGFuZCBUaW5vIFppamRlbFxuIFxuLy8gTUlUIGxpY2Vuc2VcbiBcbihmdW5jdGlvbigpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHZhciB2ZW5kb3JzID0gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgIH1cbiBcbiAgICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgICAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpOyB9LCBcbiAgICAgICAgICAgICAgdGltZVRvQ2FsbCk7XG4gICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJUaW1lICsgdGltZVRvQ2FsbDtcbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfTtcbiBcbiAgICBpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSlcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgIH07XG59KCkpOyIsImltcG9ydCBGbHV4IGZyb20gJ2ZsdXgnXG5pbXBvcnQge0V2ZW50RW1pdHRlcjJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjInXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5cbi8vIEFjdGlvbnNcbnZhciBQYWdlckFjdGlvbnMgPSB7XG4gICAgb25QYWdlUmVhZHk6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX0lTX1JFQURZLFxuICAgICAgICBcdGl0ZW06IGhhc2hcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uT3V0Q29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgIFx0UGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFLFxuICAgICAgICBcdGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBwYWdlVHJhbnNpdGlvbkRpZEZpbmlzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFBhZ2VyRGlzcGF0Y2hlci5oYW5kbGVQYWdlckFjdGlvbih7XG4gICAgICAgIFx0dHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gsXG4gICAgICAgIFx0aXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9XG59XG5cbi8vIENvbnN0YW50c1xudmFyIFBhZ2VyQ29uc3RhbnRzID0ge1xuXHRQQUdFX0lTX1JFQURZOiAnUEFHRV9JU19SRUFEWScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTjogJ1BBR0VfVFJBTlNJVElPTl9JTicsXG5cdFBBR0VfVFJBTlNJVElPTl9PVVQ6ICdQQUdFX1RSQU5TSVRJT05fT1VUJyxcbiAgICBQQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOiAnUEFHRV9UUkFOU0lUSU9OX09VVF9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURTogJ1BBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUzogJ1BBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUycsXG5cdFBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIOiAnUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gnLFxufVxuXG4vLyBEaXNwYXRjaGVyXG52YXIgUGFnZXJEaXNwYXRjaGVyID0gYXNzaWduKG5ldyBGbHV4LkRpc3BhdGNoZXIoKSwge1xuXHRoYW5kbGVQYWdlckFjdGlvbjogZnVuY3Rpb24oYWN0aW9uKSB7XG5cdFx0dGhpcy5kaXNwYXRjaChhY3Rpb24pXG5cdH1cbn0pXG5cbi8vIFN0b3JlXG52YXIgUGFnZXJTdG9yZSA9IGFzc2lnbih7fSwgRXZlbnRFbWl0dGVyMi5wcm90b3R5cGUsIHtcbiAgICBmaXJzdFBhZ2VUcmFuc2l0aW9uOiB0cnVlLFxuICAgIHBhZ2VUcmFuc2l0aW9uU3RhdGU6IHVuZGVmaW5lZCwgXG4gICAgZGlzcGF0Y2hlckluZGV4OiBQYWdlckRpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCl7XG4gICAgICAgIHZhciBhY3Rpb25UeXBlID0gcGF5bG9hZC50eXBlXG4gICAgICAgIHZhciBpdGVtID0gcGF5bG9hZC5pdGVtXG4gICAgICAgIHN3aXRjaChhY3Rpb25UeXBlKSB7XG4gICAgICAgICAgICBjYXNlIFBhZ2VyQ29uc3RhbnRzLlBBR0VfSVNfUkVBRFk6XG4gICAgICAgICAgICBcdFBhZ2VyU3RvcmUucGFnZVRyYW5zaXRpb25TdGF0ZSA9IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTU1xuICAgICAgICAgICAgXHR2YXIgdHlwZSA9IFBhZ2VyU3RvcmUuZmlyc3RQYWdlVHJhbnNpdGlvbiA/IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTiA6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVRcbiAgICAgICAgICAgIFx0UGFnZXJTdG9yZS5lbWl0KHR5cGUpXG4gICAgICAgICAgICBcdGJyZWFrXG4gICAgICAgICAgICBjYXNlIFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVRfQ09NUExFVEU6XG4gICAgICAgICAgICBcdHZhciB0eXBlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOXG4gICAgICAgICAgICBcdFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSDpcbiAgICAgICAgICAgIFx0aWYgKFBhZ2VyU3RvcmUuZmlyc3RQYWdlVHJhbnNpdGlvbikgUGFnZXJTdG9yZS5maXJzdFBhZ2VUcmFuc2l0aW9uID0gZmFsc2VcbiAgICAgICAgICAgICAgICBQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSFxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRQYWdlclN0b3JlOiBQYWdlclN0b3JlLFxuXHRQYWdlckFjdGlvbnM6IFBhZ2VyQWN0aW9ucyxcblx0UGFnZXJDb25zdGFudHM6IFBhZ2VyQ29uc3RhbnRzLFxuXHRQYWdlckRpc3BhdGNoZXI6IFBhZ2VyRGlzcGF0Y2hlclxufVxuIiwiaW1wb3J0IHNsdWcgZnJvbSAndG8tc2x1Zy1jYXNlJ1xuXG5jbGFzcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5kb21Jc1JlYWR5ID0gZmFsc2Vcblx0XHR0aGlzLmNvbXBvbmVudERpZE1vdW50ID0gdGhpcy5jb21wb25lbnREaWRNb3VudC5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IHRydWVcblx0XHR0aGlzLnJlc2l6ZSgpXG5cdH1cblx0cmVuZGVyKGNoaWxkSWQsIHBhcmVudElkLCB0ZW1wbGF0ZSwgb2JqZWN0KSB7XG5cdFx0dGhpcy5jb21wb25lbnRXaWxsTW91bnQoKVxuXHRcdHRoaXMuY2hpbGRJZCA9IGNoaWxkSWRcblx0XHR0aGlzLnBhcmVudElkID0gcGFyZW50SWRcblx0XHR0aGlzLnBhcmVudCA9IChwYXJlbnRJZCBpbnN0YW5jZW9mIGpRdWVyeSkgPyBwYXJlbnRJZCA6ICQodGhpcy5wYXJlbnRJZClcblx0XHR0aGlzLmVsZW1lbnQgPSAodGVtcGxhdGUgPT0gdW5kZWZpbmVkKSA/ICQoJzxkaXY+PC9kaXY+JykgOiAkKHRlbXBsYXRlKG9iamVjdCkpXG5cdFx0aWYodGhpcy5lbGVtZW50LmF0dHIoJ2lkJykgPT0gdW5kZWZpbmVkKSB0aGlzLmVsZW1lbnQuYXR0cignaWQnLCBzbHVnKGNoaWxkSWQpKVxuXHRcdHRoaXMuZWxlbWVudC5yZWFkeSh0aGlzLmNvbXBvbmVudERpZE1vdW50KVxuXHRcdHRoaXMucGFyZW50LmFwcGVuZCh0aGlzLmVsZW1lbnQpXG5cdH1cblx0cmVtb3ZlKCkge1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHRcdHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlQ29tcG9uZW50XG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VQYWdlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMucHJvcHMgPSBwcm9wc1xuXHRcdHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUgPSB0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSA9IHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLnRsSW4gPSBuZXcgVGltZWxpbmVNYXgoe1xuXHRcdFx0b25Db21wbGV0ZTp0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlXG5cdFx0fSlcblx0XHR0aGlzLnRsT3V0ID0gbmV3IFRpbWVsaW5lTWF4KHtcblx0XHRcdG9uQ29tcGxldGU6dGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGVcblx0XHR9KVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMucmVzaXplKClcblx0XHR0aGlzLnNldHVwQW5pbWF0aW9ucygpXG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmlzUmVhZHkodGhpcy5wcm9wcy5oYXNoKSwgMClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0Ly8gdmFyIHdyYXBwZXIgPSB0aGlzLmVsZW1lbnRcblxuXHRcdC8vIC8vIHRyYW5zaXRpb24gSW5cblx0XHQvLyB0aGlzLnRsSW4uZnJvbSh3cmFwcGVyLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9KVxuXG5cdFx0Ly8gLy8gdHJhbnNpdGlvbiBPdXRcblx0XHQvLyB0aGlzLnRsT3V0LnRvKHdyYXBwZXIsIDEsIHsgb3BhY2l0eTowLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0pXG5cblx0XHQvLyByZXNldFxuXHRcdHRoaXMudGxJbi5wYXVzZSgwKVxuXHRcdHRoaXMudGxPdXQucGF1c2UoMClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbkluKCkge1xuXHRcdHRoaXMudGxJbi50aW1lU2NhbGUoMS40KVxuXHRcdHNldFRpbWVvdXQoKCk9PnRoaXMudGxJbi5wbGF5KDApLCA4MDApXG5cdH1cblx0d2lsbFRyYW5zaXRpb25PdXQoKSB7XG5cdFx0aWYodGhpcy50bE91dC5nZXRDaGlsZHJlbigpLmxlbmd0aCA8IDEpIHtcblx0XHRcdHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKClcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMudGxPdXQudGltZVNjYWxlKDEuMilcblx0XHRcdHNldFRpbWVvdXQoKCk9PnRoaXMudGxPdXQucGxheSgwKSwgNTAwKVxuXHRcdH1cblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvcHMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSwgMClcblx0fVxuXHRkaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSB7XG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpLCAwKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0fVxuXHRmb3JjZVVubW91bnQoKSB7XG5cdFx0dGhpcy50bEluLnBhdXNlKDApXG5cdFx0dGhpcy50bE91dC5wYXVzZSgwKVxuXHRcdHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKClcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHR0aGlzLnRsSW4uY2xlYXIoKVxuXHRcdHRoaXMudGxPdXQuY2xlYXIoKVxuXHR9XG59XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IHtQYWdlclN0b3JlLCBQYWdlckFjdGlvbnMsIFBhZ2VyQ29uc3RhbnRzLCBQYWdlckRpc3BhdGNoZXJ9IGZyb20gJ1BhZ2VyJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ1BhZ2VzQ29udGFpbmVyX2hicydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcblxuY2xhc3MgQmFzZVBhZ2VyIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLmN1cnJlbnRQYWdlRGl2UmVmID0gJ3BhZ2UtYidcblx0XHR0aGlzLndpbGxQYWdlVHJhbnNpdGlvbkluID0gdGhpcy53aWxsUGFnZVRyYW5zaXRpb25Jbi5iaW5kKHRoaXMpXG5cdFx0dGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQgPSB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5kaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUgPSB0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5kaWRQYWdlVHJhbnNpdGlvbk91dENvbXBsZXRlID0gdGhpcy5kaWRQYWdlVHJhbnNpdGlvbk91dENvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLmNvbXBvbmVudHMgPSB7XG5cdFx0XHQnbmV3LWNvbXBvbmVudCc6IHVuZGVmaW5lZCxcblx0XHRcdCdvbGQtY29tcG9uZW50JzogdW5kZWZpbmVkXG5cdFx0fVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHRzdXBlci5yZW5kZXIoJ0Jhc2VQYWdlcicsIHBhcmVudCwgdGVtcGxhdGUsIHVuZGVmaW5lZClcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU4sIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4pXG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VULCB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dClcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdHdpbGxQYWdlVHJhbnNpdGlvbkluKCkge1xuXHRcdHRoaXMuc3dpdGNoUGFnZXNEaXZJbmRleCgpXG5cdFx0dGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10ud2lsbFRyYW5zaXRpb25JbigpXG5cdH1cblx0d2lsbFBhZ2VUcmFuc2l0aW9uT3V0KCkge1xuXHRcdHRoaXMuY29tcG9uZW50c1snb2xkLWNvbXBvbmVudCddLndpbGxUcmFuc2l0aW9uT3V0KClcblx0fVxuXHRkaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0UGFnZXJBY3Rpb25zLnBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoKClcblx0XHR0aGlzLnVubW91bnRDb21wb25lbnQoJ29sZC1jb21wb25lbnQnKVxuXHR9XG5cdGRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSB7XG5cdFx0UGFnZXJBY3Rpb25zLm9uVHJhbnNpdGlvbk91dENvbXBsZXRlKClcblx0fVxuXHRzd2l0Y2hQYWdlc0RpdkluZGV4KCkge1xuXHRcdHZhciBuZXdDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXVxuXHRcdHZhciBvbGRDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ29sZC1jb21wb25lbnQnXVxuXHRcdGlmKG5ld0NvbXBvbmVudCAhPSB1bmRlZmluZWQpIG5ld0NvbXBvbmVudC5wYXJlbnQuY3NzKCd6LWluZGV4JywgMilcblx0XHRpZihvbGRDb21wb25lbnQgIT0gdW5kZWZpbmVkKSBvbGRDb21wb25lbnQucGFyZW50LmNzcygnei1pbmRleCcsIDEpXG5cdH1cblx0c2V0dXBOZXdDb21wb25lbnQoaGFzaCwgVHlwZSwgdGVtcGxhdGUpIHtcblx0XHR2YXIgaWQgPSBVdGlscy5DYXBpdGFsaXplRmlyc3RMZXR0ZXIoaGFzaC5wYXJlbnQucmVwbGFjZShcIi9cIiwgXCJcIikpXG5cdFx0dGhpcy5vbGRQYWdlRGl2UmVmID0gdGhpcy5jdXJyZW50UGFnZURpdlJlZlxuXHRcdHRoaXMuY3VycmVudFBhZ2VEaXZSZWYgPSAodGhpcy5jdXJyZW50UGFnZURpdlJlZiA9PT0gJ3BhZ2UtYScpID8gJ3BhZ2UtYicgOiAncGFnZS1hJ1xuXHRcdHZhciBlbCA9IHRoaXMuZWxlbWVudC5maW5kKCcjJyt0aGlzLmN1cnJlbnRQYWdlRGl2UmVmKVxuXHRcdHZhciBwcm9wcyA9IHtcblx0XHRcdGlkOiB0aGlzLmN1cnJlbnRQYWdlRGl2UmVmLFxuXHRcdFx0aXNSZWFkeTogdGhpcy5vblBhZ2VSZWFkeSxcblx0XHRcdGhhc2g6IGhhc2gsXG5cdFx0XHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZTogdGhpcy5kaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUsXG5cdFx0XHRkaWRUcmFuc2l0aW9uT3V0Q29tcGxldGU6IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZSxcblx0XHRcdGRhdGE6IEFwcFN0b3JlLnBhZ2VDb250ZW50KClcblx0XHR9XG5cdFx0dmFyIHBhZ2UgPSBuZXcgVHlwZShwcm9wcylcblx0XHRwYWdlLnJlbmRlcihpZCwgZWwsIHRlbXBsYXRlLCBwcm9wcy5kYXRhKVxuXHRcdHRoaXMuY29tcG9uZW50c1snb2xkLWNvbXBvbmVudCddID0gdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J11cblx0XHR0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXSA9IHBhZ2Vcblx0XHRpZihQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPT09IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUykge1xuXHRcdFx0dGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J10uZm9yY2VVbm1vdW50KClcblx0XHR9XG5cdH1cblx0b25QYWdlUmVhZHkoaGFzaCkge1xuXHRcdFBhZ2VyQWN0aW9ucy5vblBhZ2VSZWFkeShoYXNoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHR1bm1vdW50Q29tcG9uZW50KHJlZikge1xuXHRcdGlmKHRoaXMuY29tcG9uZW50c1tyZWZdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuY29tcG9uZW50c1tyZWZdLnJlbW92ZSgpXG5cdFx0fVxuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdFBhZ2VyU3RvcmUub2ZmKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTiwgdGhpcy53aWxsUGFnZVRyYW5zaXRpb25Jbilcblx0XHRQYWdlclN0b3JlLm9mZihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VULCB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dClcblx0XHR0aGlzLnVubW91bnRDb21wb25lbnQoJ29sZC1jb21wb25lbnQnKVxuXHRcdHRoaXMudW5tb3VudENvbXBvbmVudCgnbmV3LWNvbXBvbmVudCcpXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VQYWdlclxuXG4iLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiY29udGVudFwiOiB7XG5cdFx0XCJ0d2l0dGVyX3VybFwiOiBcImh0dHBzOi8vdHdpdHRlci5jb20vY2FtcGVyXCIsXG5cdFx0XCJmYWNlYm9va191cmxcIjogXCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vQ2FtcGVyXCIsXG5cdFx0XCJpbnN0YWdyYW1fdXJsXCI6IFwiaHR0cHM6Ly9pbnN0YWdyYW0uY29tL2NhbXBlci9cIixcblx0XHRcImxhYl91cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vbGFiXCIsXG5cdFx0XCJsYW5nXCI6IHtcblx0XHRcdFwiZW5cIjoge1xuXHRcdFx0XHRcImNhbXBlcl9sYWJcIjogXCJDYW1wZXIgTGFiXCIsXG5cdFx0XHRcdFwic2hvcF90aXRsZVwiOiBcIlNob3BcIixcblx0XHRcdFx0XCJzaG9wX21lblwiOiBcIk1lblwiLFxuXHRcdFx0XHRcInNob3Bfd29tZW5cIjogXCJXb21lblwiLFxuXHRcdFx0XHRcInBsYW5ldFwiOiBcIlBsYW5ldFwiLFxuXHRcdFx0XHRcIm1hcF90eHRcIjogXCJNQVBcIlxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRcImxhbmdzXCI6IFtcImVuXCIsIFwiZnJcIiwgXCJlc1wiLCBcIml0XCIsIFwiZGVcIiwgXCJwdFwiXSxcblxuXHRcImhvbWUtdmlkZW9zXCI6IFtcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvODQwYTNmNjcyOWIxZjUyZjQ0NmFhZTZkYWVjOTM5YTNlY2E0YzBjMS9hcmVsbHVmLWNhcGFzLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yMmIzNjBjOGNhMzk5Njk2OTg1MzEzZGRlOTliYTgzZDRlYzk3MmI3L2FyZWxsdWYtZHViLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yOTgwZjE0Y2M4YmQ5OTEyYjE0ZGNhNDZhNGNkNGE4NWZhMDQ3NzRjL2FyZWxsdWYta29iYXJhZi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTgxOWMzNzNmOTc3Nzg1MmYzOTY3Y2UwMjNiY2ZiMGQ5MTE1Mzg2Zi9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zZGNmZDcwYzcwNzI2OTJlYTNhNzM5YWVmNTM3NmIwMjZiMDRiNjc1L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMTNiYmI2MTE5NTE2NDg3M2Q4MjNhM2I5MWEyYzgyYWNjZWZiM2VkZC9kZWlhLWR1Yi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNGJiNmU0ODViNzE3YmY3ZGJkZDVjOTQxZmFmYTJiMTg4NGU5MDgzOC9kZWlhLW1hcnRhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9lNDI0ODg5YWMwMjZmNzBlNTQ0YWYwMzAzNWU3MTg3ZjM0OTQxNzA1L2RlaWEtbWF0ZW8ubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIzNDQ0ZDNjODY5M2U1OWY4MDc5ZjgyN2RkMTgyYzVlMzM0MTM4NzcvZXMtdHJlbmMtYmVsdWdhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82ZWFmYWU3ZjFiM2JjNDFkODU2OTczNTU3YTJmNTE1OThjODI0MWE2L2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy85Yjk0NzFkY2JlMWY5NGZmN2IzNTA4ODQxZjY4ZmYxNWJlMTkyZWU0L2VzLXRyZW5jLW1hcnRhLm1wNFwiXG5cdF0sXG5cblx0XCJkZWZhdWx0LXJvdXRlXCI6IFwiXCIsXG5cblx0XCJyb3V0aW5nXCI6IHtcblx0XHRcIi9cIjoge1xuXHRcdFx0XCJ0ZXh0c1wiOiB7XG5cdFx0XHRcdFwidHh0X2FcIjogXCJCYWNrIHRvIHRoZSByb290cy4gSW5zcGlyYXRpb25zIGZvciBvdXIgbmV3IGNvbGxlY3Rpb24gY29tZXMgZnJvbSB0aGUgYmFsZWFyaWMgaXNsYW5kIG9mIE1hbGxvcmNhLCB0aGUgZm91bmRpbmcgZ3JvdW5kIG9mIENhbXBlci4gVmlzaXQgdGhyZWUgZGlmZmVyZW50IHNwb3RzIG9mIHRoZSBpc2xhbmQgLSBEZWlhLCBFcyBUcmVuYyBhbmQgQXJlbGx1ZiAtIGFzIGludGVycHJldGVkIGJ5IGNyZWF0aXZlIGRpcmVjdG9yLCBSb21haW4gS3JlbWVyLlwiLFxuXHRcdFx0XHRcImFfdmlzaW9uXCI6IFwiQSBWSVNJT04gT0ZcIlxuXHRcdFx0fSxcblx0XHRcdFwiYXNzZXRzXCI6IFtcblx0XHRcdFx0XCJiYWNrZ3JvdW5kLmpwZ1wiXG5cdFx0XHRdXG5cdFx0fSxcblxuICAgICAgICBcImRlaWEvbWF0ZW9cIjoge1xuICAgICAgICBcdFwic2hvZXNcIjogW1xuICAgICAgICBcdFx0XCJzXzAucG5nXCIsXG4gICAgICAgIFx0XHRcInNfMS5wbmdcIixcbiAgICAgICAgXHRcdFwic18yLnBuZ1wiXG4gICAgICAgIFx0XVxuICAgICAgICB9LFxuICAgICAgICBcImRlaWEvZHViXCI6IHtcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWlhL21hcnRhXCI6IHtcbiAgICAgICAgfSxcblxuICAgICAgICBcImVzLXRyZW5jL2JlbHVnYVwiOiB7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZXMtdHJlbmMvaXNhbXVcIjoge1xuICAgICAgICB9LFxuXG5cdFx0XCJhcmVsbHVmL2NhcGFzXCI6IHtcblx0XHR9LFxuICAgICAgICBcImFyZWxsdWYvcGVsb3Rhc1wiOiB7XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9tYXJ0YVwiOiB7XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9rb2JhcmFoXCI6IHtcbiAgICAgICAgfSxcblx0XHRcImFyZWxsdWYvZHViXCI6IHtcbiAgICAgICAgfSxcbiAgICAgICAgXCJhcmVsbHVmL3BhcmFkaXNlXCI6IHtcbiAgICAgICAgfVxuXG5cdH1cbn0iXX0=
