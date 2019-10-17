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
});

router.get('/author', function(req, res, next) {
  console.log("Oh i am called")
  res.json(
    [
      {
        keyTest: "author"
      }
    ]
  );
})

router.get('/key_words', function(req, res, next) {
  console.log("Oh i am called")
  res.json(
    [
      {
        keyTest: "key words"
      }
    ]
  );
})

router.get('/paper_id', function(req, res, next) {
  console.log("Oh i am called")
  res.json(
    [
      {
        keyTest: "paper id"
      }
    ]
  );
})




module.exports = router;
