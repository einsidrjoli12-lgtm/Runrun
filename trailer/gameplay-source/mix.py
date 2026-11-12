#!/usr/bin/env python3
"""Join the gameplay segments (hard cuts), lay the game's own music and sounds under them, encode."""
import json, os, subprocess, sys, shutil
D = os.path.dirname(os.path.abspath(__file__))
CL, OUT, FPS = f"{D}/clips", sys.argv[1], 30
SFXJS, ST = f"{D}/../trailer/sfx.js", '/home/user/Runrun/soundtrack'
SEGS = ['s1', 's2', 's3', 's4', 's5']
MUS = {'s1': '01-farm-pond', 's2': '02-willow-river', 's3': '03-glacier-lake', 's4': '05-open-ocean', 's5': '06-midnight-trench'}
DROP = {'nibble', 'reelTick', 'click', 'setFight', 'resetMusic', 'deny'}
def run(a):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], capture_output=True, text=True)
    if r.returncode: sys.exit(r.stderr)
seq = f"{D}/seq"; shutil.rmtree(seq, ignore_errors=True); os.makedirs(seq)
n, t0, events, cues = 0, 0.0, [], []
for s in SEGS:
    j = json.load(open(f"{CL}/{s}.json")); fr = sorted(os.listdir(f"{CL}/{s}"))
    for f in fr: os.symlink(f"{CL}/{s}/{f}", f"{seq}/{n:05d}.jpg"); n += 1
    dur = len(fr) / FPS
    last = {}
    for e in sorted(j['sfx'], key=lambda e: e['t']):
        if e['k'] in DROP or e['t'] >= dur: continue
        if e['t'] - last.get(e['k'], -9) < (0.5 if e['k'] in ('coin', 'goal') else 0.15): continue
        last[e['k']] = e['t']; events.append({'t': round(t0 + e['t'], 4), 'k': e['k'], 'a': e['a']})
    if s == 's4':  # the fight theme from the hook to just after the win
        hk = next(e['t'] for e in j['sfx'] if e['k'] == 'hook'); win = next(e['t'] for e in j['sfx'] if e['k'] == 'monsterWin')
        cues += [(MUS[s], 20.0, t0, hk), ('07-legend-on-the-line', 2.0, t0 + hk, win - hk + .6), (MUS[s], 40.0, t0 + win + .6, dur - win - .6)]
    else: cues.append((MUS[s], 8.0 * SEGS.index(s), t0, dur))
    t0 += dur
TOTAL = t0
job = f"{D}/sfx.json"; json.dump({'duration': TOTAL + 1.5, 'events': events, 'rain': []}, open(job, 'w'))
sfx = f"{D}/sfx.wav"
r = subprocess.run(['node', SFXJS, job, sfx], capture_output=True, text=True)
if r.returncode: sys.exit(r.stderr)
ins, fl = [], []
for i, (f, off, start, d) in enumerate(cues):
    ins += ['-i', f"{ST}/{f}.mp3"]; last = i == len(cues) - 1; ln = d + (0 if last else .12)
    fo = f"afade=t=out:st={max(0, ln - 1.5):.3f}:d=1.5" if last else f"afade=t=out:st={d:.3f}:d=0.12"
    ms = int(start * 1000)
    fl.append(f"[{i}:a]atrim=start={off:.3f}:duration={ln:.3f},asetpts=PTS-STARTPTS,afade=t=in:d={0.6 if i == 0 else 0.04},{fo},adelay={ms}|{ms}[m{i}]")
fl.append(''.join(f'[m{i}]' for i in range(len(cues))) + f"amix=inputs={len(cues)}:normalize=0,apad,atrim=duration={TOTAL:.3f}[mus]")
music = f"{D}/music.wav"; run([*ins, '-filter_complex', ';'.join(fl), '-map', '[mus]', '-ar', '44100', music])
def lufs(p):
    e = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(e.rsplit(' I:', 1)[1].split('LUFS')[0])
gs, gm = -17 - lufs(sfx), -19 - lufs(music)
mixed = f"{D}/mix.wav"
run(['-i', sfx, '-i', music, '-filter_complex', f"[0:a]volume={gs:.2f}dB,atrim=duration={TOTAL:.3f}[s];[1:a]volume={gm:.2f}dB[m];[s][m]amix=inputs=2:normalize=0,alimiter=limit=0.89,loudnorm=I=-14:TP=-1.5:LRA=11[a]", '-map', '[a]', '-ar', '48000', mixed])
run(['-framerate', str(FPS), '-i', f"{seq}/%05d.jpg", '-i', mixed, '-map', '0:v', '-map', '1:a', '-vf', 'scale=1080:1920', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT])
print('done', OUT, f"{TOTAL:.1f}s", len(events), 'sounds')
