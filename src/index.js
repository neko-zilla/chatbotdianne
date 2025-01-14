const tmi = require('tmi.js');
const fs = require('fs'); // Requerimos el módulo fs para leer el archivo JSON

// Cargar las frases desde el archivo JSON
let quotes = [];
fs.readFile('src/frases_anime.json', 'utf8', (err, data) => {
    if (err) {
        console.log('Error al leer el archivo JSON:', err);
    } else {
        quotes = JSON.parse(data); // Parsear el archivo JSON
    }
});

const options = {
    options: {
        debug: true
    },
    identity: {
        username: 'ajolomochi',
        password: 'w00bls6rjdb3c4cdx1o7rn3qm15t15'
    },
    channels: ['dianneriivera']
};

const client = new tmi.Client(options);

let isSendingQuotes = false; // Por defecto las frases están desactivadas
let firstMessageSent = false; // Variable para asegurar que el primer mensaje se envíe solo una vez

client.connect();

client.on('connected', (address, port) => {
    console.log(`Conectado a ${address}:${port}`);

    // Escuchar los comandos en el chat
    client.on('chat', (target, context, message, self) => {
        if (self) return; // No responder a los propios mensajes

        const isModerator = context.mod || (context.badges && context.badges.broadcaster === '1'); // Comprobar si es el streamer o moderador
        const command = message.trim().toLowerCase(); // Obtener el comando sin espacios

        if (command === '!fraseson' && isModerator) {
            if (!isSendingQuotes) {
                isSendingQuotes = true;
                client.say(target, '¡Las frases están activadas!');

                // Retrasar el primer mensaje 10 segundos para evitar el error de mensaje rápido
                setTimeout(() => {
                    // Enviar una frase inmediatamente si es el primer mensaje
                    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                    client.say(target, `"${randomQuote.frase}" - ${randomQuote.personaje} (${randomQuote.anime})`);

                    // Asegurarse de que solo se active el setInterval después de enviar el primer mensaje
                    if (!firstMessageSent) {
                        firstMessageSent = true; // Marcar que el primer mensaje fue enviado

                        // Enviar una frase cada 5 minutos (300000 ms)
                        setInterval(() => {
                            if (isSendingQuotes) {
                                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                                client.say(target, `"${randomQuote.frase}" - ${randomQuote.personaje} (${randomQuote.anime})`);
                            }
                        }, 300000); // 300000 milisegundos = 5 minutos
                    }
                }, 10000); // 10000 milisegundos = 10 segundos
            } else {
                client.say(target, 'Las frases ya están activadas.');
            }
        }

        if (command === '!frasesoff' && isModerator) {
            if (isSendingQuotes) {
                isSendingQuotes = false;
                client.say(target, '¡Las frases están desactivadas!');
            } else {
                client.say(target, 'Las frases ya están desactivadas.');
            }
        }
    });
});
