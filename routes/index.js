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
  console.log("paper id called",req.query)
  let paper_id = "0796f6cd7f0403a854d67d525e9b32af3b277331"
  let base_url = 'http://api.semanticscholar.org/v1/paper/'
  let stub_url = base_url + paper_id;
  let api_url = base_url+req.query.paper_id
  references = []

  console.log

  requestPaper(stub_url)
  .then(doc=>{
    doc=doc.body
    console.log(doc.references.filter(ref=> ref.isInfluential).length)
    console.log(doc.citations.filter(ref=> ref.isInfluential).length)
    // doc.citations.filter(ref=>ref.isInfluential).forEach(ref=>{
    //   requestPaper(base_url+ref.paperId)
    //   .then(doc=>{
    //     console.log("explored");
    //   })
    //   .catch(err=>{
    //     console.log("Error")
    //   })
    // })
    res.json(
      [
        doc
      ]
    );
  })
  .catch(error=>{
    res.json({error: error})
  })

})

requestPaper = function(url){
  var sockets = require('../app.js').sockets
  console.log(sockets.length)
  var options = {
    uri: url,
    resolveWithFullResponse: true,
    json: true // Automatically parses the JSON string in the response
  }
  return new Promise((resolve,reject)=>{
    request(options)
    .then(res=>{
      resolve(res)
    })
    .catch(err=>{
      reject(err)
    })
  })
}



module.exports = router;
