var future = messaging.future_factory();
var install = messaging.handle;

install('double',
  function (n, reply) { reply(n * 2); });

function run1() { future('double', 10, alert); }

install('fact',
  function (n, reply) {
    if (n == 0) reply(1);
    else
      future('fact', n - 1,
        function (f) { future('multiply', n, f, reply); });
  });

install('multiply',
  function (x, y, reply) { reply(x * y); });

function run2() {
  var t1 = new Date();
  future('fact', 4,
    function (v) {
      var t2 = new Date();
      alert('Start time: ' + t1 + '\nComplete time: ' + t2 + '\nResult: ' + v); });
}
