import { Listener } from "discord-akairo";
import { BotClient } from "./SkyClient";

export class BotListener extends Listener {
	public client = super.client as BotClient
}