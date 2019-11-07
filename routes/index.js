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


//10.1038/nrn3242   Default doi for testing
router.get('/paper_id', function(req, res, next) {
  console.log("paper id called")
  console.log(req.query)
  let paper_doi = "10.1038/nrn3242"
  let base_url = 'http://api.semanticscholar.org/v1/paper/'
  let stub_url = base_url + paper_doi;
  let api_url = stub_url+req.query.paper_id
  var options = {
    uri: stub_url,
    resolveWithFullResponse: true,
    json: true // Automatically parses the JSON string in the response
  }
  references = []
  request(options)

  .then(doc=>{
    doc=doc.body
    console.log()
    //
    doc.references.filter(ref=> ref.isInfluential).forEach(ref => {
      console.log("I am isInfluential")
      // options.uri=base_url+ref.paperId
      // request(options)
      //
      // .then(doc=>{
      //   references.push(doc)
      //   console.log(references.length)
      //   console.log(doc.statusCode)
      // })
      // .catch(err=>{
      //   console.log("an error occured : ",err.statusCode)
      //   if(err.statusCode == 504){
      //     setTimeout(err => {
      //       request(err.options).then(doc=>{console.log(doc.statusCode)})
      //     },1000)
      //   }
      // })
    })
    doc.citations.filter(ref=> ref.isInfluential).forEach(ref => {
      console.log("I am isInfluential")
      // options.uri=base_url+ref.paperId
      // request(options)
      //
      // .then(doc=>{
      //   references.push(doc)
      //   console.log(references.length)
      //   console.log(doc.statusCode)
      // })
      // .catch(err=>{
      //   console.log("an error occured : ",err.statusCode)
      //   if(err.statusCode == 504){
      //     setTimeout(err => {
      //       request(err.options).then(doc=>{console.log(doc.statusCode)})
      //     },1000)
      //   }
      // })
    })
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




module.exports = router;
