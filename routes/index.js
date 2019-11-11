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
  let paper_id = "10.1145/964725.633027"
  let base_url = 'http://api.semanticscholar.org/v1/paper/'
  let stub_url = base_url + paper_id;
  let api_url = base_url+req.query.paper_id
  let socket_id = req.query.socket_id
  references = []
  var topics = []
  var topics_full = []
  var sockets = require('../sockets/socket_manager.js').sockets
  console.log("# of connections : ",sockets.length)
  console.log("This socket is ",socket_id)
  var socket = sockets.find(sock => sock.id == socket_id)
  console.log(socket.id)
  requestPaper(stub_url)
  .then(doc=>{
    doc=doc.body
    res.json(
      [
        doc
      ]
    );
    let counter = 1;
    console.log("# of references : ",doc.references.filter(ref=> ref.isInfluential).length)
    console.log("# of citations : ",doc.citations.filter(ref=> ref.isInfluential).length)
    var citations = doc.citations.filter(ref=>ref.isInfluential)
    citations.forEach(ref=>{
      requestPaper(base_url+ref.paperId)
      .then(doc=>{
        console.log(counter)
        counter+=1;
        // console.log(doc.body.citations.length)
        socket.emit('new_node', doc.body);
        doc.body.topics.forEach(example=>{
          // console.log(topic)

          if(!(topics.includes(example.topicId))){
            topics.push(example.topicId);
          }
          topics_full.push(example.topicId)

          console.log("topics # : ",topics.length, "FULL TOPIC : ", topics_full.length)
        })
      })
      .catch(err=>{
        // console.log(err)
      })
    })
    doc.references.filter(ref=>ref.isInfluential).forEach(ref=>{
      requestPaper(base_url+ref.paperId)
      .then(doc=>{
        socket.emit('new_node', doc.body);
        doc.body.topics.forEach(example=>{
          /*
          if((topics.findIndex(topic))> -1){
            topics.push(topic);
          }
          topics_full.push(topic)
          */

          if(!(topics.includes(example.topicId))){
            topics.push(example.topicId);
          }
          topics_full.push(example.topicId)

        })
      })
      .catch(err=>{
      })
    })
    doc.topics.forEach(example=>{
      if(!(topics.includes(example.topicId))){
        topics.push(example.topicId);
      }
      topics_full.push(example.topicId);
    })

    console.log("---------->    La famille : " + topics.length)
  })
  .catch(error=>{
    res.json({error: error})
  })
})

requestPaper = function(url){
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
