const express = require('express'); // Sets up the web server.
const jwt = require('jsonwebtoken'); // Generates and signs JWTs.
const cors = require('cors'); // Allows cross-origin requests.
const path = require('path'); // Handles file paths.

const app = express();
app.use(cors());

// Private key — set via TINYMCE_PRIVATE_KEY env var on Render (or use the fallback for local dev)
const DEFAULT_PRIVATE_KEY = `
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDNQiImlQGBVkfc
oVHLkPzNiCMYzl1Qg5EklUBcF38MKWAc9jSep1E3gAPbtPO5+YjfYiiQDjfMYI/h
PKGh8Qu+Liz7JKP0AQz7WepdMsHnqaRcsNefjZUlzBrgFdrlkUIbWmfALcSEmsxl
eS5PLb22hNkdQ33FlsxtusUdmLYvoxDmtSZObxGxi/u9a7iyMKWdxP4rXyfJqwOv
1NIN1yyOppTYfo9cHcKxdbsyBCNGjQgm7vWnORo5dj/faU3argLTWjz9Mch/1xRZ
VNRsoM/oD/HTd3Z9f7dcZdIOan/zIsEdo670MjJ4RWPbPp6aXy/NonXen+WZSrC8
mGFN3i8pAgMBAAECgf8i8ToY84HNUvaWalv0Rs6l7BKWs4re0CbAM5LR7ZNwdycB
dUGDjIs/ipJlQO+628uhogq9BI/lK3OMUc+HSn7pwFBUCVD7ktDwAF5Za1tH2rKo
0Eo2tQcwQWYjxmF9nUVVI8TUIFa6xIHOdaf5F9U2WhLSQdx9KTMkhDKgUE7ipXPu
//CiNRU3of0Y9WnzfRLpIUXJoI0Irvj1sI53Mg4+e7bS+a1j8rWT/FKAd2TspYDU
Mzof7TplYtITW+jLZxcbeEKlFTuDnYS+jTPUo0gn6ufCQXUnEg55rN4/ljgBXsxD
xKv6ioYsf/BDRMkwsZMLqH65g2rFcU5RusbMXQECgYEA5nGDot7WSBgXXymy5o0N
IItAXEKS+bnUC0AqOn9o2tYf0pxRV5FFkE513RZmDcK92IDsWLpxCfOGbxTzKR2G
7ms4rIGYR/NTBD6iuZi+NvRYI5lAQ6uDKw2PEAjrKIP6K8maNcQ1Dg0isDTXC3Q4
ULp5LGA0eMH2Gp+v5QOv+QECgYEA5AWX2tiu0YCHHwEjKe3iWjOepDbpvEYdPvcr
Z3sd2qSaG1HZdNN6KOSrzpR0v13GpbRDwdnHxVm51yMUpSBOuCvcytaqHLlHJnsZ
5VA3EIPsyGpdotyDEgECB6ZCuD6mTLfX3ou7PeIX06GpsiK01WMm0RHFD1VVCZxW
ks/RTikCgYEAs8Kq7/sqZrS8TpSlpKk1K0TVIOMh6cInAdu81UMcVVEhI9aisU92
V1qNILjfRS67j08KjzBpC103aiGKiXEqF4P2gsLZOo86HB6MK4FWKGI0+xgKBH+f
Y49BIT4Dyugg19V9ASIcTOi8PX4Knjm70GWWLqKha+3J//y/ZkOZGwECgYEA0fmM
kwzCP046H4TumqfirummBtZCewud1uPJZmtrXHIDL3E57Gjpr0qUI5F1yNtUGDdd
xd8EJWmwxroZQs3zb4mEsozm7bh4Gql1eUNa0ayKmSvJujWRxTyEYALsobmfbjpF
YTwPWrce9dWC7PUkzPOXRSM18h7ERitfVaZlubECgYEAz21DB7tyEbyC27RsCnv4
2VYjooUnqt5klEX20llmaj6R0Xr6HLSrObunI761X9JdIH+XOFZiNWx9Z9L+9Qii
/DnzPqx0VzFtE0tMws1qBiunBXpD5gfekHw/Rpvlb65mq/43c+R8J7Kv6N5GezME
SbF5X7dVQwKWSf2vL/VChBk=
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
const apiKey = process.env.TINYMCE_API_KEY || 'prsghhxax677rv082a1zj9b7cgjuoaqysf7h8ayxi5ao43ha';


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