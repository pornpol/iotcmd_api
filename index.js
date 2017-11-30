
const express = require('express')
const bodyParser = require('body-parser')

const app = express()

// var options = {
//   inflate: true,
//   limit: '100kb',
//   type: 'application/json'
// }

// app.use(bodyParser.raw(options))
app.use(bodyParser.json())

const port = 3000
//sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000

var fs = require("fs"), 
    json;

/////////////////////////////////////////////////////
function readJsonFileSync(filepath, encoding){
  if (typeof (encoding) == 'undefined'){
      encoding = 'utf8'
  }
  var file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file)
}

function writeJsonFileSync(filepath, content){
  fs.writeFile(filepath, content, function(err) {
    if(err) {
        return console.log(err)
    }
    console.log("The file was saved!")
  })
}

function appendLogFile(dir, filename, content){
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  fs.appendFile(dir+'/'+filename, content, function(err) {
    if(err) {
        return console.log(err)
    }
    console.log("Appened log file!")
  })
}

function updateRequestRestart(id){
  var filename = './req/' + id + '.json'
  var file_content = fs.readFileSync(filename);
  var content = JSON.parse(file_content);
  if(content.restart === 1)
  {
    content.restart = 0;
    fs.writeFileSync(filename, JSON.stringify(content, null, 2));
    console.log('The file was Updated!');
  }
}

function getRequest(id){
  var filepath = './req/' + id + '.json';
  return readJsonFileSync(filepath);
}

function getConfig(id){
  var filepath = './config/' + id + '.json';
  return readJsonFileSync(filepath);
}
/////////////////////////////////////////////////////

app.get('/api', (req, res) => {
  res.send(`Hello IoTCmd API!`)
})

// get req & update
app.get('/api/enres/nreq/:id', (req, res) => {
  const id = req.params.id
  try{
    res.send(getRequest(id))
    updateRequestRestart(id)
  }
  catch(err){
    // Load Default
    console.log('The default file was loaded!')

    writeJsonFileSync('req/'+id+'.json', JSON.stringify(getRequest('default'), null, 2))
    res.send(getRequest('default'))
  }
})

// get req no update
app.get('/api/enres/req/:id', (req, res) => {
  const id = req.params.id
  try{
    res.send(getRequest(id))
  }
  catch(err){
    // Load Default
    console.log('The default file was loaded!')
    res.send(getRequest('default'))
    writeJsonFileSync('req/'+id+'.json', JSON.stringify(getRequest('default'), null, 2))
  }
})

app.get('/api/enres/config/:id', (req, res) => {
  const id = req.params.id
  res.send(getConfig(id))
})

app.post('/api/enres/req/:id', (req, res) => {
  const id = req.params.id

  writeJsonFileSync('req/'+id+'.json', JSON.stringify(req.body, null, 2))

  res.set('Content-Type', 'application/json')
  res.send(`{"success":1}`)
})

app.post('/api/enres/config/:id', (req, res) => {
  const id = req.params.id

  writeJsonFileSync('config/'+id+'.json', JSON.stringify(req.body, null, 2))
  
  res.set('Content-Type', 'application/json')
  res.send(`{"success":1}`)
})

app.post('/api/enres/log/:id', (req, res) => {
  const id = req.params.id
  var logMsg = ""

  for(var key in req.body)
  {
    logMsg = logMsg + req.body[key].dt + " : " + req.body[key].msg + "\r\n"
  }
  appendLogFile('log/'+id, (new Date()).toISOString().substring(0, 10)+'.log', logMsg)

  res.set('Content-Type', 'application/json')
  res.send(`{"success":1}`)
})

app.listen(port, () => {
  console.log(`Web/API server listening on port ${port}!`)
})