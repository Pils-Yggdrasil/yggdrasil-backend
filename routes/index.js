var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("Oh i am called")
  res.json(
    [
      {
        keyTest: "valueTest"
      }
    ]
  );
}
);

module.exports = router;
