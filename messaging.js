var debug = false;
var messaging = {};

(function () {
    var dlog = function () {
      if (debug) console.log.apply(console, arguments);
    }

    messaging.active_page = function () {
      return safari.application.activeBrowserWindow.activeTab.page;
    };

    var domain =
      typeof(safari.application) === 'undefined' ? 'injected' : 'global';

    var UNKNOWN = ' Unknown Message ', REPLY = ' Reply ';
    var handler = {};
    var on_replies = {};
    var reply_id = 0;

    var delay = function () { return Math.floor(Math.random() * 1000); };

    (domain === 'injected' ? safari.self : safari.application)
    .addEventListener('message',
      function (ev) {
        dlog('Received', ev);
        (handler[ev.name] || handler[UNKNOWN])(ev);
      },
      false);

    var future_factory = function () {
      var page = (domain === 'injected' ?
        (function () { return safari.self.tab; }) :
        messaging.active_page);

      var future = function (command /* varargs */) {
        var ev = {
          command: command,
          argv: Array.prototype.slice.call(arguments, 1) };

        var last = ev.argv.slice(-1)[0];
        if (typeof(last) === 'function') {
          on_replies[ev.reply_to = ' ' + reply_id + ' '] = last;
          reply_id++
          ev.argv = ev.argv.slice(0, -1);
        }

        dlog('Sending message ', ev);
        page().dispatchMessage(ev.command, ev);
      };
      return future;
    };

    var install = function (command, do_handle) {
      handler[command] = function (ev) {
        var msg = ev.message;
        var reply_to = msg.reply_to;
        var on_reply = function (v) {
          if (reply_to) {
            var page =
              (domain === 'injected' ? safari.self.tab : ev.target.page);
            var msg =  { command: REPLY, argv: [reply_to, v] }
            dlog('Replying ', msg);
            page.dispatchMessage(msg.command, msg);
          }
        }
        msg.argv.push(on_reply);
        do_handle.apply(null, msg.argv);
      };
    };

    install(UNKNOWN,
      function (ev) { dlog('Unknown message name:', ev); });

    install(REPLY, function (reply_to, v) {
        var on_reply = on_replies[reply_to];
        delete on_replies[reply_to];
        on_reply(v);
      });

    messaging.future_factory = future_factory;
    messaging.install = install;

    if (debug) {
      messaging.handler = handler;
      messaging.on_replies = on_replies;
    }
  })();
