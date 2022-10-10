const createBrowserless = require('browserless')
const express = require('express')

const PORT = process.env.PORT || 5000
const app = express();

app.use(express.json())

app.disable('x-powered-by');
app.use('/', async (req, res) => {
    try {
        const browserlessFactory = createBrowserless()

        const browserless = await browserlessFactory.createContext()

        let buffer = await browserless.screenshot('http://' + req.query.url, {
            device: 'Macbook Pro 15'
        })

        await browserless.destroyContext()

        await browserlessFactory.close()

        let img = Buffer.from(buffer, 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
          });

        return res.end(img);

    } catch (error) {
        return res.status(500).json({ eoor: error.message })
    }
})

app.listen(PORT, ()=>{console.log('listening on port '+PORT)})


