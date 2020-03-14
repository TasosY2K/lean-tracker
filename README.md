# Lean Tracker 🛰️

A fast and easy to use ip logger built on express.js 🛰️

![screenshot](https://cdn.discordapp.com/attachments/609854271810306049/688383063004282905/Screenshot_1.png)
![screenshot](https://media.discordapp.net/attachments/609854271810306049/688390816682475546/Screenshot_1.png)
[Live Demo](https://lean-tracker-demo.herokuapp.com/)

## Installation
Make sure you have a MySQL database running
```bash
$ service mysql status
```
Clone this respository using git
```bash
$ git clone https://github.com/TasosY2K/lean-tracker.git
```
Go to the cloned directory and make a file named `config.json`
```bash
$ cd lean-tracker
$ touch config.json
```
Then open `config.json` and edit in the required info
```json
{
  "port":"<your-server-port>",
  "url":"<your-server-url>",
  "database":{
    "host":"<your-database-url>",
    "database":"<your-database-name>",
    "user":"<your-database-username>",
    "password":"<your-database-password>"
  }
}

```
Start the application with npm
```bash
$ npm start
```
## License
[ISC](https://choosealicense.com/licenses/isc/)
