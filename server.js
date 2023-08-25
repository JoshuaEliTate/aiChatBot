const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const session = require('express-session');
let tokenAmount = 100
// let messages = [ ];
let aiPrompt = "you are an assistant"
// let labsVoice = "rXXkqBiJdKlYp8wOIbM4"
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
let clients = {};
const cron = require('node-cron');
const path = require('path');

require('dotenv').config();

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
    
  if (!req.session.messages) {
      req.session.messages = [];
  }

  req.session.messages.push({ role: 'user', content: userInput });
  runText(userInput, req.session.messages, req); 

  res.sendStatus(200);
  // const userInput = req.body.userInput;
  // runText(userInput);
  // res.sendStatus(200);
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.session.messages) {
    req.session.messages = [];
}
  console.log('Received file', req.file);
  console.log(req.body.uniqueId)
  const inputFilePath = req.file.path;
  const outputFilePath = req.file.path + '.wav';
  const mp3File= req.body.uniqueId
  const voiceId = req.session.voice
    try {
        ffmpeg(inputFilePath)
        .inputFormat('webm')
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
    
            const aiResponse = await runChatCompletion(transcription, req.session.messages, mp3File, voiceId);
            res.json({ aiResponse });
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



async function runChatCompletion(audio, messages, mp3File, voiceId) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': process.env.OPENAI_AUTH
  };
  messages.push({ role: 'user', content: audio })
  console.log(voiceId)

  const data = {
    model: 'gpt-3.5-turbo-16k-0613',
    messages: messages,
    max_tokens : tokenAmount,
    temperature: 1
  };

  try {
    const response = await axios.post(url, data, { headers });
    const result = response.data;
    const messageContent = result.choices[0].message.content;
    console.log(messageContent);
    messages.push({ role: 'assistant', content: messageContent });

    const audioResponse = await receiveAudio(messageContent, mp3File, voiceId);
    return audioResponse;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

function receiveAudio(aiText, randomAudioName, voiceId) {
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
      fs.writeFile(`public/audio/${randomAudioName}.mp3`, audioContent, 'binary', err => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log(`Audio received and saved as ${randomAudioName}`);
        }
      });
    // }
    })
    .catch(error => {
      console.error('Error:', error.response.status);
    });
}


async function runText(userInput, messages, req) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': process.env.OPENAI_AUTH,  // Replace with your API key
  };

  messages.push({ role: 'user', content: userInput });

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
        try {
          const parsed = JSON.parse(message);
          const content = parsed.choices[0].delta.content;
          userClients.forEach(client => {
            client.write(`data: ${content}\n\n`);
          });
        } catch (error) {
          console.error('Could not JSON parse stream message', message, error);
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


app.listen(port, () => console.log(`Server listening on port ${port}`));

app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile("./public/index.html", { root: __dirname });
})

app.post("/api", (req, res) => {
  if (!req.session.messages) {
    req.session.messages = [];
    req.session.voice = "rXXkqBiJdKlYp8wOIbM4";
}
  chosenVoice = req.body.voice
  tokenAmount = parseInt(req.body.tokens)
  aiPrompt = req.body.prompt
  
  if(chosenVoice == "discovery"){
    req.session.voice = "rXXkqBiJdKlYp8wOIbM4"
    req.session.messages.push({"role": "system", "content": aiPrompt})
  } else if (chosenVoice == "dave"){
    req.session.voice = "pNInz6obpgDQGcFmaJgB"
    req.session.messages.push({"role": "system", "content": aiPrompt})
  } else if (chosenVoice == "hannah"){
    req.session.voice = "21m00Tcm4TlvDq8ikWAM"
    req.session.messages.push({"role": "system", "content": aiPrompt})
  } else if (chosenVoice == "sam"){
    req.session.voice = "rhtRSG7Rhld2ATYPoZqE"
    req.session.messages.push({"role": "system", "content": aiPrompt})
  } else if (chosenVoice == "oldMan"){
    req.session.voice = "yj1DgNOwhkbtB0N7oP5B"
    req.session.messages.push({"role": "system", "content": "i want you to respond to the user as if you are donald trump, dont say tremendous every sentence. do not break character"})
  }

  
  
  
  if (tokenAmount < 25) tokenAmount = 25;
  if (tokenAmount > 300) tokenAmount = 300;
 
  console.log(chosenVoice)
  console.log(tokenAmount);
  console.log(aiPrompt)


  res.json({
    message: "It's perfect, I received all the data"
  });
})

app.post("/send-data", (req, res) => {
  console.log(req.body)
receiveAudio(req.body.entireResponse, req.body.divID, req.session.voice)
})


// This will run every day at 2:00 AM
cron.schedule('0 2 * * *', function() {
  const directoryPath = path.join(__dirname, 'public/audio');
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  fs.readdir(directoryPath, (err, files) => {
      if (err) return console.log('Unable to scan directory: ' + err);

      files.forEach(file => {
          fs.stat(path.join(directoryPath, file), (err, stat) => {
              if (err) return console.error(err);

              const now = new Date().getTime();
              const endTime = new Date(stat.ctime).getTime() + expirationTime;
              if (now > endTime) {
                  fs.unlink(path.join(directoryPath, file), err => {
                      if (err) return console.error(err);
                      console.log(`Deleted: ${file}`);
                  });
              }
          });
      });
  });
});
