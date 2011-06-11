var debug = true;
var messaging = {};

(function () {
    var UNKNOWN = ' Unknown Message ', REPLY = ' Reply ';
    var handler = {};
    var on_replies = {};
    var reply_id = 0;

    var delay = function () { return Math.floor(Math.random() * 1000); };

    var dispatch = function (ev) {
      var command = ev.command;
      var ms = delay();
      setTimeout(function () {
//        alert('Dispatching [' + command + '] after ' + ms + 'ms delay');
          (handler[command] || handler[UNKNOWN])(ev);
        },
        ms);
    };

    var reply = function (reply_to, v) {
      var on_reply = on_replies[reply_to];
      delete on_replies[reply_to];
      on_reply(v);
    };

    var future = function (dispatch, ev, on_reply) {
      if (on_reply) {
        ev.reply_to = ' ' + reply_id + ' ';
        on_replies[ev.reply_to] = on_reply;
        reply_id++;
      }
      dispatch(ev);
    };

    var future_factory = function (/* dispatch */) {
      return function (command) {
        var argv = Array.prototype.slice.call(arguments, 1);
        var argc = argv.length;
        var on_reply = (argc > 0 && typeof (argv[argc - 1] === 'function') ?
          argv[argc - 1] : null);
        future(dispatch, { command: command, argv: argv }, on_reply);
      }
    };

    var handle = function (command, do_handle) {
      handler[command] = function (ev) {
        var reply = function (v) {
          if (ev.reply_to) {
//          alert('Reply to: ' + ev.reply_to);
            future(dispatch,
              { command: REPLY, argv: { reply_to: ev.reply_to, value: v } });
          }
        }
        ev.argv.push(reply);
        do_handle.apply(null, ev.argv);
      };
    };

    handle(UNKNOWN,
      function (name) {
        alert('Unknown message name (' + name + ')');
      });

    handle(REPLY,
      function (info) { reply(info.reply_to, info.value); });

    messaging.future_factory = future_factory;
    messaging.handle = handle;

    if (debug) {
      messaging.handler = handler;
      messaging.on_replies = on_replies;
    }
  })();
