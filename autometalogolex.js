let express = require('express');
let app = express();
let handlebars = require('express3-handlebars').create({defaultLayout: 'image'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
let datajson = require('./public/img/data.json');

app.use(express.static(__dirname + '/public'));

// main route; displays latest comic
app.get('/', (req, res) => {
    let latestIndex = datajson.length - 1;
    let title = datajson[latestIndex][0],
        source = '/img/' + datajson[latestIndex][1]
        text = datajson[latestIndex][2],
        date = datajson[latestIndex][3] + '/' + datajson[latestIndex][4] + '/' + datajson[latestIndex][5],
        prev = latestIndex - 1,
        next = '';
    res.render('index', {
        title,
        date,
        source,
        text,
        prev,
        next
    });
});

// special pages router
app.get('/archive', (req, res) => {
    let comic = [];
    for(i = datajson.length; i > 0; i--){
        comic[datajson.length - i] = '<a href="/' + (i-1) + '" class="item">' + datajson[i-1][0] + '</a> \
        (' + datajson[i-1][3] + '/' + datajson[i-1][4] + '/' + datajson[i-1][5] + ')<br/>';
    }
    res.render('archive', {
        layout: 'archive',
        comic
    });
});

app.get('/about', (req, res) => {
    res.render('about', { layout: 'about' });
});

// other routes in integers return corresponding comic
app.get('/*', (req,res) => {
    let path = parseInt(req.path.slice(1));
    let prev, next;
    if (path >= 0 && path < datajson.length){
        let title = datajson[path][0],
            source = '/img/' + datajson[path][1]
            text = datajson[path][2],
            date = datajson[path][3] + '/' + datajson[path][4] + '/' + datajson[path][5];
        if (path === 0 || datajson.length === 1){
            // bug when datajson.length === 1
            prev = '',
            next = path + 1;
        } else if (path === datajson.length - 1){
            prev = path - 1,
            next = '';
        } else {
            prev = path - 1,
            next = path + 1;
        }
        res.render('index', {
            title,
            date,
            source,
            text,
            prev,
            next
        });
    } else {
        // comic not found
        res.status(404);
        res.render('404', { layout: 'error' });
    }
});

// errors, though 404 is actually useless 
// 'cos the last /* route had caught all 404s.
app.use((req, res) => {
    res.status(404);
    res.render('404', { layout: 'error' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.render('500', { layout: 'error' });
});

app.listen(app.get('port'), () => {});
