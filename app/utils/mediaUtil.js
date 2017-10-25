import { remote } from 'electron';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import child_process from 'child_process';

const { app } = remote;

const promisify = (fn, context) => (...params) =>
  new Promise((res, rej) =>
    fn.call(context, ...params, (err, result) => (err ? rej(err) : res(result))),
  );

const exec = promisify(child_process.exec, child_process);

const defaultFileFormat = '%(title)s';
const defaultFileFormatWithExt = '%(title)s.%(ext)s';

console.log(app.getPath('music'));
export const getMusicFolder = () => path.join(app.getPath('music'), 'soundPlayer');

// export const downloadAudio = url => {
//   const musicPath = getMusicFolder();
//   const downloadCommand = `cd ${musicPath}; youtube-dl --no-check-certificate --extract-audio -o "%(title)s.%(ext)s" --audio-format mp3 ${url}`;
//   const filenameCommand = `youtube-dl --no-check-certificate --get-filename  -o "%(title)s.%(ext)s" ${url}`;
//   const getLengthCommand = `youtube-dl -j ${url}`;

//   //   return promisify(child_process.exec, child_process)(command).then();
//   exec(getLengthCommand).then(console.log);
//   return exec(downloadCommand).then(() => exec(filenameCommand));
// };

export const getFilenameByUrl = (url, format = defaultFileFormat) =>
  exec(`youtube-dl --no-check-certificate --get-filename  -o "${format}" ${url}`);

export const getDurationByUrl = url =>
  exec(`youtube-dl --no-check-certificate --get-duration  ${url}`);

const download = (url, musicPath, format = defaultFileFormatWithExt) =>
  exec(
    `cd ${musicPath}; youtube-dl --no-check-certificate --extract-audio -o "${format}" --audio-format mp3 ${url}`,
  );

export const downloadAudio = (url, musicPath = getMusicFolder()) =>
  download(url, musicPath).then(() => getMediaInfo(url));

export const getMediaInfo = (url, format = defaultFileFormat) =>
  Promise.all([
    getFilenameByUrl(url, format),
    getDurationByUrl(url, format),
  ]).then(([filename, duration]) => ({
    name: `${filename.trim()}`,
    path: path.join(getMusicFolder(), `${filename.trim()}.mp3`),
    duration,
  }));
