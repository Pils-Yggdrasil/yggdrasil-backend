var express = require('express');
var router = express.Router();
var request = require('request-promise');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("root")
  res.json(
    [
      {
        keyTest: "valueTest"
      }
    ]
  );
});

router.get('/author', function(req, res, next) {
  console.log("author lookup")
  res.json(
    [
      {
        keyTest: "author"
      }
    ]
  );
})

router.get('/key_words', function(req, res, next) {
  console.log("key words lookup")
  res.json(
    [
      {
        keyTest: "key words"
      }
    ]
  );
})

router.get('/paper_id', function(req, res, next) {
  console.log("paper id called")
  console.log(req.query)
  let api_url = 'http://api.semanticscholar.org/v1/paper/'+req.query.paper_id
  var options = {
    uri: api_url,
    json: true // Automatically parses the JSON string in the response
  }
  request(options)

  .then(doc=>{
    console.log(doc)
    res.json(
      [
        doc
      ]
    );
  })

  .catch(error=>{
    console.log(error)
  })
})




module.exports = router;
