const Discord = require('discord.js');
const client = new Discord.Client();
const botConfig = require("./botConfig.json");
const fs = require("fs");
const setup = require("./settings/setup.js");

client.commands = new Discord.Collection();

//Read all files in commands folder
fs.readdir("./commands/", (err, files) => {
	if(err) console.log(err);

	let jsFile = files.filter(f => f.split(".").pop() === "js");
	if(jsFile.length <= 0){
		console.log("Did not find any commands.");
		return;
	}

	jsFile.forEach((f, i) => {
		let props = require(`./commands/${f}`);
		console.log(`${f} loaded!`);
		client.commands.set(props.help.name, props);
	});
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity("MrMokka creating a bot :D", {type: "WATCHING"});
	client.guilds.forEach(guild => {
		fs.access(`./settings/${guild.id}.json`, fs.F_OK, (err) => {
			if(err){
				let info = {
					"setup": false
				}
				let data = JSON.stringify(info);
				fs.writeFileSync(`./settings/${guild.id}.json`, data);
				return
			}
		});
	});
});

client.on('message', msg => {

	if(msg.author.bot) return;
	if(msg.channel.type === "dm") return;

	const prefix = botConfig.prefix;
	const msgArray = msg.content.split(" ");
	const cmd = msgArray[0];
	const args = msgArray.slice(1);

	if(!(cmd.slice(0, 1) === prefix)) return;

	const data = JSON.parse(fs.readFileSync(`./settings/${msg.guild.id}.json`));
	if(data.setup === false && cmd != "!setup"){ //ask to run setup if setup is not done, or server reset
		return msg.reply("Setup is not complete, please run the setup command (!setup)");
	}

	setup.setup();

	const cmdF = client.commands.get(cmd.slice(prefix.length));
	if(cmdF) cmdF.run(client, msg, args);
	const debugMsg = `${msg.author.tag} ran the command: '${msg.content}'`;
	console.log(debugMsg);

});

client.on('error', console.error);


const token = require("./token.json").token;
client.login(token);
