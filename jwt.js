const express = require('express'); // Sets up the web server.
const jwt = require('jsonwebtoken'); // Generates and signs JWTs.
const cors = require('cors'); // Allows cross-origin requests.
const path = require('path'); // Handles file paths.

const app = express();
app.use(cors());

// Private key — set via TINYMCE_PRIVATE_KEY env var on Render (or use the fallback for local dev)
const DEFAULT_PRIVATE_KEY = `
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCqwdVrRRz3UgEM
J4uZA9A1F7Je/lr4H32tpTWVCKdkYGCk1S1X3F4yeUJH4OAO7tgWFxLWr5hH5Kef
E05lblfrAGB3EeZHYeloNriMM555I2wUJdTEJYfRsMnGGVPqU/o7swKCuDicxpYy
Why7MAWHhgwAYW68r3EcA7+OeessY8BEJCRXrZjSkNqDJBfKHLe/gnHqx34Yi+i7
bfSZ7ElX2xGhakm1Ps+OoUOHA71IAw1YJ/LkIrod+/LANl+DJ0PYPo4bCXbNJ3/g
orNGfpdZ05IG0fyzaTCqQTy3DRwkr0FK/3AN6sP6KI4EBiRrnPWfHk4eHuLsS91o
vCzMaPfHAgMBAAECggEABG779GKnzRQbMUGYy+RGQUELdJDBTYGKNdP9GPccjlKi
SViJN0EvGohjdcWBvvsclfyk+vk1yJThqHoYpjGM2G364AL3w6q0vYWOM4KAZT/+
/zCF3oHkja4Im+6HnnHuJIne6tEo4LxkC4w9BFWYdY6/1dKxzI+RlEFuQjjDWzR0
KarVkNMYR3SBe/1WxEzE0PX9fXCVyKDAoIJr2y7AeOjU9x7oayzm50P1jMUlsWWP
QSWaJex9b5FO56uiqMMtI139an2vJLdpGRfQsb6QLFATuasF5QGLzqFK2nFUIiQl
r3slWc5nTg5589js+KgxDG9c4dcUd050NmuJ8C2TIQKBgQDZLvHYN95t1geSLYlB
8F/CWA20ZsqfQurD2bidk96SLbcz0qsJeKR27waQhBiaPiKRb3OElHEFSqBZt4fF
hXVhBHuM2EcLbZLcwgX1n5xpVLl+VlZ/hHmboe/0tE9kg/itEr/bybAfyNJBTPKo
3NptEP+EoMev4fOigPQY53B3IwKBgQDJRrGhY3iV11keYCHxaBIA8FyKcxD3chLQ
M3Qr72UllU13/hEK91Gy3cJqNLOkhXnXdG5eYAblM1nm4NKZVFES1ANmDECrSHLn
pcGpjux7lCtIQ4Gxaf6+xRzxg378Egwt2gD9EykFu7iChr2qQkdFis8IYDhIGuAv
lKbs8PWZDQKBgFh/cZrqgR9+lE0zcvfEjDC0ErmNHUmySdmOkVTcmVg1eq6KTJmq
aFHyallfCmtnoExk/sxqdHd0hkyopZGOJVtoKTQmOSTl/G8qPKVu6ZxeIsvhQJPr
lmYdoZq0Epnh0OYterKDx9nbyhlD0qmOfQ7uW0BfB5+a0d1I8K5pOIHDAoGBAJIU
seUtOZ6e/jpSkTARVUfDK5b8bmr5Kvha78zXYfTGCMS27A2mdHA6DNliSKN2kHi0
M0phrX96JpyvvYm1LWZZ4+GTsPffjC3eGtGCPtZuMn+vJxjpkg9JJnmO84HlY1t/
5snGtzZHCWIKgutoUSwC08IDe7Wxc9Z0sDY1qDqdAoGBAJuqJB0b21q6VhMKd0dU
Am70JlwzYcr5LvQtefjcX2XqzxooQsP8nIb8mOm8pgky51D54Cegn10bRfRPFiYu
kuzO4gEFj3Fg+uxJ0xEbGbR3Fl+Xrux5mAEeaKZJ7ILU4Qb2vvuQBVbLOQF+2EAr
9GmBpuDm39p3fTOYNl6dq2tH
-----END PRIVATE KEY-----
`;

// const DEFAULT_PRIVATE_KEY = `
// -----BEGIN PRIVATE KEY-----
// MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIgwIiqtI4UX4R
// Rj9tsy/ADe2CepvG1cnppDkwqxIgPC+kYoynadWB0crL+Zq8IfEwgvMmIlaqLbuT
// t6Eii28MViYBefmvRp1hgzgeRyE2EL1A30rOeRz0q/Ofett83uMQxOnDfh9cK8rN
// 7kkmSsRjJnpoDqPGwhg89j1FBExTrm51aC5E2D8aiQqfRqfoewuBeto6Sdc9t54E
// oPeW11VeD7qjokK/gvYfd2H2pDrG33fSzois0C6x3dA8rAoWDoH2G2YnFdfhMeFD
// ZlisJwJbgPBpmcLDbi0DjrFmlHQncLWlvKQ+Vje2naEYG5r/4OPQvegJ3vF76GPS
// 9jS15wUXAgMBAAECggEAHmPDauytSuLdsrw3uHvRehAXq3sYvrnqoyeEPCJEGjBK
// X5BI1XDUGXEUsEs8OVUC9gF1h8CUQQZdvnrfiFmjXYvLBoCYUrPm/ioB/eN1nvj0
// 2MRe//cu5824nAxmABbUnwHb6jNkiQw2wx+2j4ACeYKR8nvRimTNgU59enHh0vFr
// 5l2dmUdSO5DEgcDLbBlbbAwpMwkqUhovdnSjP57x3XR9Sk6xmg+L6QtdfpP6jC09
// i7KUR3Sz2v3e8ni3y4xFSDcC/zp3F6rwez21USKZxeMWNbLFOYN5ehd6vHGenDzt
// 1+Qgkvedkrgw2ysrJc2sXL8j07S+qVz5HDAA9xSjtQKBgQD32xAv3eZCjEiv2uKV
// uxdRGHcawuEmeCsZQXnXW2l7dc7AtotOTBGbRtA5PMC1Xc6k0TQ9QsxZZFPyJITJ
// nMDse2uufYobXX+4KSThKY2KjSsF/8VQZgkdGe6EMZGVasp+1Qe3c8mbJNeO+ovM
// K2L3EdwnZY02fsqrGu6VRJjLUwKBgQDPGbFLUOyYasvR0Ac9hq+p7kbTHQWXobcs
// ++t5G7xwJURNo1yfN44eT79pG9t6CCj1ljdA4FXjA3KqLJdo2Eirf5n7HxtHsKo2
// 3Fo4bQin0lWEm0fHcopwDZ1axYiJXxeE6q2egvSMmUEGExAYEcFAtTiebpoZtfHJ
// pc0Lkk4qrQKBgH6wx+5fs2ISyNiyvp0ge8OlCMRyFpoOVKFdOYVeIWXNCviwljZY
// ZauEH80SA8LxBz5x/QzPRxruUIZ2KjXP3UFDuQABBYYFXdJpnYNGNSY8EGDJozb8
// YO4yIhwKJktEwergw0f/dG7L/y8DXE/pYXW++FRe8TaIytl5M7iyzpMnAoGAFURk
// KoHS6gv9hjxAohbUrzSi3UcbreiTcPElyzgH79RD4V0nQ8pms8Iou9h6f1ubKS0V
// 23muGDPgcI1HtyKOw93EqD8XhBMmR5/1O9omi2VUFtwDUP34LW2YfRvP25uCRMn8
// rkxwZIfQX5lRi8c2+zgg6lQdSwqeG8EE/200zbkCgYEArHyTdrv+1Myi3u/P9Xyt
// hF6Wr9gnLWjf+XQxVuED7M10eU9682hD+njQoloIDIb0Ptktk8JWPwC9fQOT9lMX
// TkmkZyXkabHSPns/Td3ACCBT2vLQ2c+ut2KLcU3JXERMnlHZVEveqLQuENSbqtOw
// Vt1zav3HQiFZETthtfhO8yc=
// -----END PRIVATE KEY-----
// `;
const rawKey = process.env.TINYMCE_PRIVATE_KEY;
const privateKey = rawKey ? rawKey.replace(/\\n/g, '\n') : DEFAULT_PRIVATE_KEY;
const apiKey = process.env.TINYMCE_API_KEY || '451hc4rk1hb0l77jr4loyiutfx7k9fs0decaxvfma65mwulu';


app.use(express.static(path.join(__dirname, 'public')));

// JWT token generation endpoint
app.post('/jwt', (req, res) => {
    const payload = {
        aud: apiKey, // TinyMCE API key (from env var or default)
        sub: 'tinyqateam10mar26', // Replace with actual user identifier
        iat: Math.floor(Date.now() / 1000), // Issue timestamp
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expiration time (60 minutes)
        auth: {
            ai: {
                permissions: [
                    'ai:conversations:*',
                    'ai:conversations:context:*',                    
                    'ai:models:*',
                    'ai:actions:system:*',
                    'ai:reviews:system:*'
                ]
            }
        }
    };

    try {
        // Tokens are signed with the RS256 algorithm using the private key
        const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate JWT token.' });
        console.error(error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});