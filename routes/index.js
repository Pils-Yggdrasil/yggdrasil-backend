var express = require('express');
var router = express.Router();
var request = require('request-promise');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("root")
  res.json(
    [{
      keyTest: "valueTest"
    }]
  );
});

router.get('/author', function(req, res, next) {
  console.log("author lookup")
  res.json(
    [{
      keyTest: "author"
    }]
  );
})

router.get('/key_words', function(req, res, next) {
  try {
    var sockets = require('../sockets/socket_manager.js').sockets
    let socket_id = req.query.socket_id;
    var papers_score = [];
    var papers_count = [];
    var socket = sockets.find(sock => sock.id == socket_id)
    var url_cross = "https://api.crossref.org/works?filter=type:journal-article&query.bibliographic="
    var url_sem = 'http://api.semanticscholar.org/v1/paper/'
    var key_words = req.query.key_words.replace(/ /g, "+");
    // var key_words = "Gradient based learning";
    url_cross = url_cross + key_words + "&facet=publisher-name:10&rows=25&sort=relevance&order=desc"
    res.json({
      success: true
    })

    requestPaper(url_cross)
      .then(list => {
        list = list.body.message.items;
        list.forEach(paper => {
          requestPaper(url_sem + paper.DOI)
            .then(pap => {
              pap = pap.body;
              console.log("TITLE = " + pap.title)
              pap.cdpScore = computeCpDScore(pap, 2)
              socket.emit('new_node', pap);
              pap.citations.forEach(citation => {
                requestPaper(url_sem + citation.paperId)
                  .then(cit => {
                    cit = cit.body;
                    console.log("CIT = " + cit.title)
                    cit.cdpScore = computeCpDScore(cit, 2)
                    socket.emit('new_node', cit);
                  })
                  .catch(err => {
                    console.log(err.message)
                  })
              })
              pap.references.forEach(reference => {
                requestPaper(url_sem + reference.paperId)
                  .then(ref => {
                    ref = ref.body;
                    console.log("REF = " + ref.title)
                    ref.cdpScore = computeCpDScore(ref, 2)
                    socket.emit('new_node', ref);
                  })
                  .catch(err => {
                    console.log(err.message)
                  })
              })

            })
            .catch(err => {
              console.log(err.message)
            })
        })
      })
      .catch(err => {
        console.log(err.message)
      })
      .finally()

  } catch (err) {
    console.log(err.message)
    res.json({
      error: err.message
    })
  }
})



router.get('/paper_id', function(req, res, next) {
  let paper_id = "0796f6cd7f0403a854d67d525e9b32af3b277331"
  // paper_id = "10.1051/m2an/2013133"
  let base_url = 'http://api.semanticscholar.org/v1/paper/'
  let socket_id = req.query.socket_id
  var topics = []
  var topics_full = []
  var paper_topics = []
  var waiting_papers = []
  var param_topic_ref = 1;
  var param_topic_cit = 2;
  var param_exponent_cit = 2;
  var param_exponent_ref = 2;
  var sockets = require('../sockets/socket_manager.js').sockets
  console.log("# of connections : ", sockets.length)
  console.log("This socket is ", socket_id)
  paper_id = req.query.paper_id

  var socket = sockets.find(sock => sock.id == socket_id)
  console.log(socket.id)
  requestPaper(base_url + paper_id)
    .then(doc => {
      doc = doc.body
      doc.cdpScore = computeCpDScore(doc, param_exponent_cit)
      doc.topics.forEach(top => {
        paper_topics.push(top.topicId)
      })
      res.json({
        success: true
      })
      socket.emit('new_node', doc);
      let counter = 1;
      var citations = doc.citations
      var references = doc.references
      console.log(citations)
      citations.forEach(ref => {
        console.log(ref)
	requestPaper(base_url + ref.paperId)
          .then(doc => {
            citation_topics = [];
            // console.log(doc.body.citations.length)
            doc.body.topics.forEach(top => {
              citation_topics.push(top.topicId)
            })
            var is_in = 0;
            citation_topics.forEach(top => {
              if (paper_topics.includes(top)) {
                is_in += 1;
              }
            })
            doc.body.cdpScore = computeCpDScore(doc.body, param_exponent_cit)
            if (is_in >= param_topic_cit) {
              socket.emit('new_node', doc.body);
            } else {
              waiting_papers.push(doc.body)
            }

          })
          .catch(err => {
            console.log(err.message)
          })
          .finally(() => {
            counter += 1;
            console.log(counter)
            if (counter == 500) {
              socket.emit('done')
            }
          })
      })
      references.forEach(ref => {
        requestPaper(base_url + ref.paperId)
          .then(doc => {
            ref_topics = [];
            doc.body.topics.forEach(top => {
              ref_topics.push(top.topicId);
            })
            var is_in = 0;

            ref_topics.forEach(top => {
              if (paper_topics.includes(top)) {
                is_in += 1
              }
            })
            if (is_in >= param_topic_ref) {
              socket.emit('new_node', doc.body);
            } else {
              waiting_papers.push(doc.body)
            }

          })
          .catch(err => {
            console.log(err.message)
          })

          .finally(() => {
            counter += 1;
            console.log(counter)
            if (counter == references.length - 1) {
              socket.emit('done')
            }
          })
      })


    })
    .catch(error => {
      res.json({
        error: error
      })
    })
})

testTopics = function(doc, topics_full, topics) {
  // SOMETHING USED fOR TESTING
  doc.topics.forEach(example => {
    if (!(topics.includes(example.topicId))) {
      topics.push(example.topicId);
    }
    topics_full.push(example.topicId);
  })

  console.log("---------->    La famille : " + topics.length)
}

computeCpDScore = function(doc, exponent) {
  let age = new Date().getFullYear() - doc.year;
  return doc.citations.length / Math.pow(age + 1, 1 / exponent)
}

requestPaper = function(url) {
  var options = {
    uri: url,
    resolveWithFullResponse: true,
    json: true // Automatically parses the JSON string in the response
  }
  return new Promise((resolve, reject) => {
    request(options)
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}



module.exports = router;
