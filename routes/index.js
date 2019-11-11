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
  let paper_id = "0796f6cd7f0403a854d67d525e9b32af3b277331"
  let base_url = 'http://api.semanticscholar.org/v1/paper/'
  let socket_id = req.query.socket_id
  references = []
  var topics = []
  var topics_full = []
  var paper_topics = []
  var waiting_papers = []
  var param_topic_ref = 1;
  var param_topic_cit = 1;
  var param_exponent_cit = 2;
  var param_exponent_ref = 2;
  var sockets = require('../sockets/socket_manager.js').sockets
  console.log("# of connections : ",sockets.length)
  console.log("This socket is ",socket_id)
  var socket = sockets.find(sock => sock.id == socket_id)
  requestPaper(base_url+paper_id)
  .then(doc=>{
    doc=doc.body
    doc.topics.forEach(top => {
      paper_topics.push(top.topicId)
    })
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
        citation_topics = [];
        // console.log(doc.body.citations.length)
        doc.body.topics.forEach(top => {
          citation_topics.push(top.topicId)
        })
        var is_in = 0;
        citation_topics.forEach(top => {
          if(paper_topics.includes(top)) {
            is_in += 1;
          }
        })
        doc.body.cdpScore = computeCpDScore(doc.body, param_exponent_cit)
        if(is_in >= param_topic_cit){
          socket.emit('new_node', doc.body);
          console.log("CITATION SENT TO FRONT !")
        } else {
          waiting_papers.push(doc.body)
          console.log("WAITING CITATION !")
        }

        // SOMETHING USED FOR TESTING
        // doc.body.topics.forEach(example=>{
        //   // console.log(topic)
        //   if(!(topics.includes(example.topicId))){
        //     topics.push(example.topicId);
        //   }
        //   topics_full.push(example.topicId)
        //
        //   console.log("topics # : ",topics.length, "FULL TOPIC : ", topics_full.length)
        // })
      })
      .catch(err=>{
        console.log(err.message)
      })
      .finally(()=>{
        counter+=1;
        console.log(counter)
        if(counter == 90){
          socket.emit('done')
        }
      })
    })
    references.forEach(ref=>{
      requestPaper(base_url+ref.paperId)
      .then(doc=>{
        ref_topics = [];
        doc.body.topics.forEach(top => {
          ref_topics.push(top.topicId);
        })
        var is_in = 0;

        ref_topics.forEach(top => {
          if(paper_topics.includes(top)) {
            is_in += 1
          }
        })
        if(is_in >= param_topic_ref) {
          socket.emit('new_node', doc.body);
          console.log("REF SENT TO FRONT !")
        } else {
          waiting_papers.push(doc.body)
          console.log("WAITING REF !")
        }

        // SOMETHING USED FOR TESTING
        // doc.body.topics.forEach(example=>{
        //   if(!(topics.includes(example.topicId))){
        //     topics.push(example.topicId);
        //   }
        //   topics_full.push(example.topicId)
        //
        // })
      })
      .catch(err=>{
        console.log(err.message)
      })
      .finally(()=>{
        counter+=1;
        console.log(counter)
        if(counter == references.length - 1){
          socket.emit('done')
        }
      })
    })

    //SOMETHING USED FOR TESTING
    // doc.topics.forEach(example=>{
    //   if(!(topics.includes(example.topicId))){
    //     topics.push(example.topicId);
    //   }
    //   topics_full.push(example.topicId);
    // })
    //
    // console.log("---------->    La famille : " + topics.length)
  })
  .catch(error=>{
    res.json({error: error})
  })
})

computeCpDScore= function(doc, exponent){
  let age = new Date().getFullYear() - doc.year;
  return doc.citations.length / Math.pow(age+1, 1/exponent)
}

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
