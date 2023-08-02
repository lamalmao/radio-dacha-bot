import { AddAudio } from './add';
import Command from './command';
import { Help } from './help';
import { TracksList } from './list';
import { PlayStream } from './play-streaming';
import { SkipMusic } from './skip';
import { StopMusic } from './stop';

const commands = new Map<string, Command>();

commands.set('play', new PlayStream());
commands.set('add', new AddAudio());
commands.set('stop', new StopMusic());
commands.set('skip', new SkipMusic());
commands.set('list', new TracksList());
commands.set('help', new Help());

export default commands;
