#!/usr/bin/env python3
"""Sound for the 3D ad: game sounds placed on the action, music cues, then mux."""
import json, os, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
FR, OUT, FPS, TOTAL = f"{D}/frames", sys.argv[1], 30, 21.5
SFXJS, ST = f"{D}/../trailer/sfx.js", '/home/user/Runrun/soundtrack'
def run(a):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], capture_output=True, text=True)
    if r.returncode: sys.exit(r.stderr)
ev = []
add = lambda t, k, a=None: ev.append({'t': t, 'k': k, 'a': a or []})
add(3.62, 'cast'); add(4.75, 'plop'); add(4.77, 'splash')
add(5.5, 'nibble'); add(5.9, 'nibble'); add(6.4, 'bite')
add(7.0, 'splash'); add(7.02, 'catch', [2, True, True]); add(7.4, 'discover')
add(10.4, 'thunder'); add(12.0, 'hook'); add(12.6, 'nibble'); add(12.9, 'nibble')
add(13.3, 'splash'); add(13.3, 'thunder'); add(13.32, 'hook')
add(14.6, 'monsterWin'); add(14.65, 'splash')
for k in range(5): add(15.0 + k * 1.45, 'coin')
add(18.0, 'plop'); add(18.1, 'fanfare'); add(19.2, 'buy')
job = f"{FR}/sfx.json"; json.dump({'duration': TOTAL + 1.5, 'events': ev, 'rain': []}, open(job, 'w'))
sfx = f"{FR}/sfx.wav"
r = subprocess.run(['node', SFXJS, job, sfx], capture_output=True, text=True)
if r.returncode: sys.exit(r.stderr)
CALM, FIGHT, COAST = f"{ST}/05-open-ocean.mp3", f"{ST}/07-legend-on-the-line.mp3", f"{ST}/04-rocky-coast.mp3"
cues = [(CALM, 0.0, 0.0, 10.4), (FIGHT, 4.0, 10.4, 4.2), (COAST, 0.0, 14.6, TOTAL - 14.6)]
ins, fl = [], []
for i, (f, off, start, d) in enumerate(cues):
    ins += ['-i', f]; last = i == len(cues) - 1; ln = d + (0 if last else .25)
    fo = f"afade=t=out:st={max(0, ln - 2.5):.3f}:d=2.5" if last else f"afade=t=out:st={d:.3f}:d=0.25"
    ms = int(start * 1000)
    fl.append(f"[{i}:a]atrim=start={off:.3f}:duration={ln:.3f},asetpts=PTS-STARTPTS,afade=t=in:d={1.5 if i == 0 else 0.05},{fo},adelay={ms}|{ms}[m{i}]")
fl.append(''.join(f'[m{i}]' for i in range(len(cues))) + f"amix=inputs={len(cues)}:normalize=0,apad,atrim=duration={TOTAL:.3f}[mus]")
music = f"{FR}/music.wav"; run([*ins, '-filter_complex', ';'.join(fl), '-map', '[mus]', '-ar', '44100', music])
def lufs(p):
    e = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(e.rsplit(' I:', 1)[1].split('LUFS')[0])
gs, gm = -16 - lufs(sfx), -19 - lufs(music)
mixed = f"{FR}/mix.wav"
run(['-i', sfx, '-i', music, '-filter_complex', f"[0:a]volume={gs:.2f}dB,atrim=duration={TOTAL:.3f}[s];[1:a]volume={gm:.2f}dB[m];[s][m]amix=inputs=2:normalize=0,alimiter=limit=0.89,loudnorm=I=-14:TP=-1.5:LRA=11[a]", '-map', '[a]', '-ar', '48000', mixed])
run(['-framerate', str(FPS), '-i', f"{FR}/%05d.jpg", '-i', mixed, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT])
print('done', OUT, len(ev), 'sounds')
