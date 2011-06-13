messaging.install('alert',
  function (text, n) { console.log('alert', text, n); });

messaging.install('add',
  function (a, b, reply) { reply(a + b); });

function run1() {
  var future = messaging.future_factory();
  future('alert', 'Hello world from global code.', 777);
  future('add', 12345, 6789, function (v) { console.log(v); });
}
