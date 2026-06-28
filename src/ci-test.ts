import {
    Client,
    Collection,
    Events,
    MessageFlags
} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from "node:url";

declare module "discord.js" {
	interface Client {
		commands: Collection<String, any>
	}
}

const client = new Client({ intents: []});

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await import(`file://${filePath}`);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command.default && 'execute' in command.default) {
			client.commands.set(command.default.data.name, command.default);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    client.destroy();
    process.exit(0);
});

const sleep = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    client.login(process.env.TOKEN);
    await sleep(15000);
    console.log('Bot failed to login');
    client.destroy();
    process.exit(1);
}

main();
