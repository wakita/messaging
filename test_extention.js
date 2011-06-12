var is_injected = typeof(safari.application) === 'undefined';

var handler = {};

((is_injected ? safari.self : safari.application)
  .addEventListener('message', function (ev) {
      console.log('Received: ' + JSON.stringify(ev, [ 'name', 'message' ], 2));
        handler[ev.name](ev);
    }, false));

handler.alert = function (ev) {
  alert(ev.message[0]);
  var n = ev.message[1];
  if (n > 0) {
    proxy(ev).dispatchMessage('alert',
      [ is_injected? 'Hello from injected' : 'Hello from global', n - 1 ]);
  }
};

function proxy(ev) {
  return is_injected ? safari.self.tab : ev.target.page;
}

function start_injected_code() {
  proxy().dispatchMessage('alert', [ 'Hello from injected code.', 5 ]);
}

if (is_injected) $(start_injected_code);
