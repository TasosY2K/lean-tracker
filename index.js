// One nighter coding challenge the grabify clone
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const shortid = require('shortid');
const moment = require('moment');

const config = require('./config.json');
const func = require('./functions/functions.js');

let connection = mysql.createConnection(config.database);
let app = express();

app.use(express.static('images'))
app.set('view engine', 'pug');

connection.query('CREATE DATABASE IF NOT EXISTS grabify_clone', (err) => {
  connection.query('USE grabify_clone', (err) => {
    connection.query(func.readSql('./sql/create_table_tracker.sql'), (err) => {
      connection.query(func.readSql('./sql/create_table_ip.sql'), (err) => {
        if (err) {
          console.log('Database error: ', err);
          func.shutdown();
        } else {
          console.log('Database setup completed');
        }
      });
    });
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM tracker WHERE id = '${id}'`;

  connection.query(sql, (err, results, fields) => {
    if (results.length > 0) {

      let id = results[0].id;
      let timestamp = moment().format('YYYY-MM-DD HH:mm:ss Z');
      let useragent = req.headers['user-agent'];

      sql = `INSERT INTO ip (
        id,
        ip_address,
        time_captured,
        user_agent
      ) VALUES (
        '${id}',
        '${req.ip}',
        '${timestamp}',
        '${useragent}'
      )`;

      let original_url = results[0].original_url;

      connection.query(sql, (err) => {
        res.redirect(original_url);
      });

    } else {
      res.redirect('/');
    }
  });
});

app.get('/monitor/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM tracker WHERE admin_id = '${id}'`;

  connection.query(sql, (err, results, fields) => {
    if (results.length > 0) {
      id = results[0].id;
      sql = `SELECT * FROM ip WHERE id = '${id}'`;

      let tracker_info = results[0];

      connection.query(sql, (err, results, fields) => {
        let ip_info = results;

        res.render('monitor', {ip_info: ip_info, tracker_info: tracker_info});
      });

    } else {
      res.render('alert', {alert: 'Monitor does not exist'});
    }
  });
});

app.post('/create', (req, res) => {
  let original_url = req.query.url;
  if (original_url) {
    if (func.validateUrl(original_url)) {
      let id = shortid.generate();
      let admin_id = shortid.generate();

      let sql = `INSERT INTO tracker (
        id,
        admin_id,
        original_url,
        short_url,
        monitoring_url
      ) VALUES (
        '${id}',
        '${admin_id}',
        '${original_url}',
        '${config.url}/${id}',
        '${config.url}/monitor/${admin_id}'
      )`;

      connection.query(sql, (err) => {
        if (err) {
          console.log('Database error: ', err);
          res.sendStatus(503);
        } else {
          res.json({
            id: id,
            admin_id: admin_id,
            original_url: original_url,
            short_url: `${config.url}/${id}`,
            monitoring_url: `${config.url}/monitor/${admin_id}`
          });
        }
      });
    } else {
      res.render('alert', {alert: 'Input not validated'});
    }
  } else {
    res.redirect('/');
  }
});

app.listen(config.port, '0.0.0.0');
console.log('Server started at port', config.port);
