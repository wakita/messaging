var is_injected = typeof(safari.application) === 'undefined';

var handler = {};

((is_injected ? safari.self : safari.application)
  .addEventListener('message', function (ev) {
      console.log('Received: ' +
          JSON.stringify({ name: ev.name, message: ev.message }));
        handler[ev.name](ev);
    }, false));

handler.alert = function (ev) {
  alert(ev.message);
  if (!is_injected)
    ev.target.page.dispatchMessage('alert', 'Hello from global code.');
};

function proxy() {
  return (is_injected ?
    safari.self.tab : safari.application.activeBrowserWindow.activeTab.page);
}

function start_injected_code() {
  proxy().dispatchMessage('alert', 'Hello from injected code.');
}

if (is_injected) $(start_injected_code);
