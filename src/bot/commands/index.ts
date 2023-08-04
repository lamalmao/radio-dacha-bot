import { AddAudio } from './add';
import { Clear } from './clear';
import Command from './command';
import { Help } from './help';
import { TracksList } from './list';
import { PlayStream } from './play-streaming';
import { SkipMusic } from './skip';
import { StopMusic } from './stop';
import { Top } from './top';

const commands = new Map<string, Command>();

commands.set('play', new PlayStream());
commands.set('add', new AddAudio());
commands.set('stop', new StopMusic());
commands.set('skip', new SkipMusic());
commands.set('list', new TracksList());
commands.set('help', new Help());
commands.set('clear', new Clear());
commands.set('top', new Top());

export default commands;
