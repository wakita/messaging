var future = messaging.future_factory();
var install_message_handler = messaging.handle;

install_message_handler('double',
  function (n, reply) { reply(n * 2); });

function run1() { future('double', 10, alert); }

function run2() {

  install_message_handler('fact',
    function (n, reply) {
      if (n == 0) reply(1);
      else
        future('fact', n - 1,
          function (f) { future('multiply', { x: n, y: f }, reply); });
    });

  install_message_handler('multiply',
    function (arg, reply) { reply(arg.x * arg.y); });

  future('fact', 4, alert);
}
