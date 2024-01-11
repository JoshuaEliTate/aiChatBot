const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const session = require('express-session');
let tokenAmount = 100
let aiPrompt = "you are an assistant"
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
let clients = {};
const cron = require('node-cron');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // 'uploads/' is the directory where files will be saved
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Get file extension
    const name = path.basename(file.originalname, ext); // Get file name without extension
    cb(null, `${name}-${Date.now()}${ext}`) // Append Date to filename to avoid overwriting and preserve extension
  }
});

const messagesPageMap = {
  discovery: "messages1", // Replace with the actual value
  dave: "messages2", // Replace with the actual value
  brock: "messages3", // Replace with the actual value
  brandon: "messages4", // Replace with the actual value
  oldMan: "messages5", // Replace with the actual value
};
let messagesPage = messagesPageMap['discovery'] || "defaultMessagesPage";
const upload2 = multer({ storage: storage });

require('dotenv').config();

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// const upload2 = multer({ dest: 'public/audio/' });
const upload = multer({ dest: 'uploads/' });
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'))
app.use(express.static(process.env.NGROK_IP))
app.use(cors());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.post('/chat', (req, res) => {
  const userInput = req.body.userInput;
  const voiceValue = req.body.voiceValue 
  messagesPage = messagesPageMap[voiceValue] || "defaultMessagesPage";
  if (!req.session[messagesPage]) {
      req.session[messagesPage] = [];
      // req.session.messages.push({ role: "system", content: "You are a factual/conversation chatbot that is also sarcastic. never ask what you can help the user with" })
      // console.log('hello' + req.session[messagesPage])
  }

  req.session[messagesPage].push({ role: 'user', content: userInput });
  // console.log(characterPage)
  // console.log(req.session[messagesPage])
  runText(userInput, req.session[messagesPage], req); 

  res.sendStatus(200);

});




// app.post('/phoneUpload', upload2.single('file'), async (req, res) => {
//   if (!req.session.messages) {
//     req.session.messages = [];
// }
// try {

  
//   // Process the file here, and send response
//   const inputFilePath = req.file.path
//   console.log(`Received file ${req.file.originalname} saved as ${req.file.filename}`);
//   const resp = await openai.createTranscription(
//     fs.createReadStream(inputFilePath),
//     "whisper-1"
//   );
//   const transcription = resp.data.text;
//   console.log(transcription);
//   res.json({ transcription });
// } catch (error) {
//   console.error(error);
//   console.error('Error with OpenAI API:', error.message);
//   res.status(500).json({ error: 'Error transcribing audio' });
// }

// })




app.post('/upload', upload.single('file'), async (req, res) => {
  let fileFormat = ''
  console.log(req.file.mimetype)
  voiceValue = req.body.voiceValue
  messagesPage = messagesPageMap[voiceValue] || "defaultMessagesPage";
  if (!req.session[messagesPage]) {
    req.session[messagesPage] = [];
} 
if (req.file.mimetype == 'audio/webm'){
  fileFormat = 'webm'
} else if(req.file.mimetype == 'audio/mp3') {
  fileFormat = 'mp3'
} else{
  fileFormat = 'mp4'
}
console.log("line 125" + fileFormat)
// console.log(fileFormat)
// console.log(req.file.mimetype)
// console.log('the file stuff for the users voice   ' + req.file.originalname)
//   console.log('Received file', req.file);
//   console.log(req.body.uniqueId)
  const inputFilePath = req.file.path;
  const outputFilePath = req.file.path + '.wav';
  const mp3File= req.body.uniqueId
  const voiceId = req.session.voice
    try {
        ffmpeg(inputFilePath)
        .inputFormat(`${fileFormat}`)
        .audioCodec('pcm_s16le')
        .format('wav')
          .on('end', async () => {
            console.log('File has been converted.');
    
            const resp = await openai.createTranscription(
              fs.createReadStream(outputFilePath),
              "whisper-1"
            );
            const transcription = resp.data.text;
            console.log(transcription);
            res.json({ transcription });
            // const aiResponse = await runChatCompletion(transcription, req.session.messages, mp3File, voiceId);
            // res.json({ aiResponse });
          })
          .on('error', err => {
            console.error('An error occurred: ' + err.message);
            res.status(500).json({ error: 'Error converting audio' });
          })
          .save(outputFilePath);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error transcribing audio' });
      }


});



app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sessionId = req.sessionID;

  if (!clients[sessionId]) {
    clients[sessionId] = [];
    
  }

  clients[sessionId].push(res);

  req.on('close', () => {
    clients[sessionId] = clients[sessionId].filter(client => client !== res);
  });
});

function receiveAudio(aiText, randomAudioName, voiceId, callback) {
  console.log(callback == undefined)
  console.log(voiceId)
  console.log(!voiceId)
  if(!voiceId){
    voiceId = "rXXkqBiJdKlYp8wOIbM4"
  }
  console.log(voiceId)
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=0`;
  const headers = {
    'accept': 'audio/mpeg',
    'xi-api-key': process.env.XI_API_KEY,
    'Content-Type': 'application/json'
  };
  const payload = {
    "text": `${aiText}`,
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
      "stability": 0,
      "similarity_boost": 0
    }
  };
console.log(randomAudioName)
  return axios.post(url, payload, { headers, responseType: 'arraybuffer' })
    .then(response => {
      const audioContent = Buffer.from(response.data, 'binary');
      if(callback == undefined){
      fs.writeFile(`public/audio/${randomAudioName}.mp3`, audioContent, 'binary', err => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log(`Audio received and saved as ${randomAudioName}`);
        }
      })}else{
        fs.writeFile(`public/audio/${randomAudioName}.mp3`, audioContent, 'binary',callback, err => {
          if (err) {
            console.error('Error:', err);
          } else {
            console.log(`Audio received and saved as ${randomAudioName}`);
          }
      })};
    // }
    })
    .catch(error => {
      console.error('Error at audio creation:', error);
    });
}

async function runText(userInput, messages, req) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': process.env.OPENAI_AUTH,  // Replace with your API key
  };

  // messages.push({ role: 'user', content: userInput });

  const data = {
    model: 'gpt-3.5-turbo-16k-0613',
    messages: messages,
    temperature: 1,
    stream: true,
  };

  try {
    const res = await axios.post(url, data, {
      headers,
      responseType: 'stream',
    });

    res.data.on('data', data => {
      console.log('Received data:', data.toString());
      const lines = data.toString().split('\n').filter(line => line.trim() !== '');
      const sessionId = req.sessionID; // obtain the session ID from request
      const userClients = clients[sessionId];
      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          userClients.forEach(client => {
            client.write(`event: end\ndata: end\n\n`);  // broadcasting the end event
            client.end();
          })
          return; 
        }
        let content;
        try {
          const parsed = JSON.parse(message);
          if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
            content = parsed.choices[0].delta.content;
          }
          // const content = parsed.choices[0].delta.content;
          // userClients.forEach(client => {
          //   client.write(`data: ${content}\n\n`);
          // });
        } catch (error) {
          console.error('Could not JSON parse stream message', message, error);
          const match = message.match(/"content":"([^"]+)"/);
          if (match) {
            content = match[1];
          }
        }
        if (content) {
          userClients.forEach(client => {
            client.write(`data: ${content}\n\n`);
          });
        }
      }
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

setInterval(() => {
  for (let sessionId in clients) {
    if (!clients[sessionId] || clients[sessionId].length === 0) {
      delete clients[sessionId];
    }
  }
}, 1000 * 60 * 30);


app.listen(port, () => {
console.log(`Server listening on port ${port}`)
});

app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile("./public/index.html", { root: __dirname });
    res.sendFile("./public/talkToAiPage.html", { root: __dirname });
})

app.post("/api", (req, res) => {
  // voiceValue = req.body.voiceValue
  // messagesPage = `messages${voiceValue}`


  chosenVoice = req.body.voice
  tokenAmount = parseInt(req.body.tokens)
  aiPrompt = req.body.prompt
  

  
  // Use the object to get the messagesPage value
  messagesPage = messagesPageMap[chosenVoice] || "discovery";
  // console.log(messagesPage)
  if (!req.session[messagesPage]) {
    req.session[messagesPage] = [];
    req.session.voice = "ZQe5CZNOzWyzPSCn5a3c";
}



  if(chosenVoice == "discovery"){
    req.session.voice = "ZQe5CZNOzWyzPSCn5a3c"
    req.session[messagesPage].push({"role": "system", "content": aiPrompt})
  } else if (chosenVoice == "dave"){
    req.session.voice = "2xAA8Mq7kKsLu073Lzth"
    req.session[messagesPage].push({"role": "system", "content": aiPrompt})
  } else if (chosenVoice == "brock"){
    req.session.voice = "34OUhgtptnyUZQzpySED"
    req.session[messagesPage].push({"role": "system", "content": "i want you to respond to the user as if you are barack obama. do not break character"})
  } else if (chosenVoice == "brandon"){
    req.session.voice = "YiSNFXgXXPhLn2tENa1R"
    req.session[messagesPage].push({"role": "system", "content": "i want you to respond to the user as if you are joe biden, as his senile self. do not break character"})
  } else if (chosenVoice == "oldMan"){
    req.session.voice = "l4xcIvq1eDzZKwkamxfM"
    req.session[messagesPage].push({"role": "system", "content": "i want you to respond to the user as if you are donald trump, dont say tremendous every sentence. do not break character"})
  }

  
  
  
  if (tokenAmount < 25) tokenAmount = 25;
  if (tokenAmount > 300) tokenAmount = 300;
 
  // console.log(chosenVoice)
  // console.log(tokenAmount);
  // console.log(aiPrompt)


  res.json({
    message: "It's perfect, I received all the data"
  });
})



app.post("/cacheClear", (req, res) => {
  delete req.session[messagesPage];
  req.session.save(err => {
    if (err) {
      console.error('Error saving session:', err);
      return res.status(500).send('Error clearing messages');
    }
    console.log('Messages cleared!');
  });
})


app.post("/send-data", (req, res) => {
  // console.log(req.body);
  
  // Assuming receiveAudio creates and writes the MP3 file
  receiveAudio(req.body.entireResponse, req.body.divID, req.session.voice, (err) => {
    if (err) {
      // Handle the error, maybe send a response to the frontend to notify of the failure
      return res.status(500).send({ error: 'Failed to create audio file.' });
    }

    // Send a success response (or some other data you might want to return)
    res.send({ status: 'Audio created successfully.' });
  });
  console.log("audio Created")
});
// app.post("/send-data", (req, res) => {
//   console.log(req.body)
// receiveAudio(req.body.entireResponse, req.body.divID, req.session.voice)

// })


// This will run every day at 2:00 AM
// cron.schedule('0 2 * * *', function() {
//   const directoryPath = path.join(__dirname, 'public/audio');
//   const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

//   fs.readdir(directoryPath, (err, files) => {
//       if (err) return console.log('Unable to scan directory: ' + err);

//       files.forEach(file => {
//           fs.stat(path.join(directoryPath, file), (err, stat) => {
//               if (err) return console.error(err);

//               const now = new Date().getTime();
//               const endTime = new Date(stat.ctime).getTime() + expirationTime;
//               if (now > endTime) {
//                   fs.unlink(path.join(directoryPath, file), err => {
//                       if (err) return console.error(err);
//                       console.log(`Deleted: ${file}`);
//                   });
//               }
//           });
//       });
//   });
// });



app.post("/phoneTest", (req, res) => {
  console.log('it worked properly');
});