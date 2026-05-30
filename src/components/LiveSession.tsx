'use client';
import { useEffect, useState } from 'react';
import { Room, RoomEvent, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Track } from 'livekit-client';

interface Props {
  token: string;
  serverUrl: string;
  participantName: string;
  roomName: string;
  onDisconnect?: () => void;
}

export default function LiveSession({ token, serverUrl, participantName, onDisconnect }: Props) {
  const [room] = useState(() => new Room());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function connect() {
      try {
        await room.connect(serverUrl, token);
        if (cancelled) return;
        setConnected(true);
        setParticipants(Array.from(room.remoteParticipants.values()));
        room.on(RoomEvent.ParticipantConnected, () => setParticipants(Array.from(room.remoteParticipants.values())));
        room.on(RoomEvent.ParticipantDisconnected, () => setParticipants(Array.from(room.remoteParticipants.values())));
        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Video) { const el = document.getElementById(`video-${participant.identity}`) as HTMLVideoElement | null; if (el) track.attach(el); }
          if (track.kind === Track.Kind.Audio) { const el = document.getElementById(`audio-${participant.identity}`) as HTMLAudioElement | null; if (el) track.attach(el); }
        });
        room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
          try { const msg = JSON.parse(new TextDecoder().decode(payload)) as { sender: string; text: string }; setMessages((prev) => [...prev, msg]); } catch {}
        });
        room.on(RoomEvent.Disconnected, () => { if (!cancelled) onDisconnect?.(); });
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Connection failed');
      }
    }
    connect();
    return () => { cancelled = true; room.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl, token]);

  function sendMessage() {
    if (!input.trim() || !connected) return;
    const msg = { sender: participantName, text: input.trim() };
    room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(msg)), { reliable: true }).catch(() => {});
    setMessages((prev) => [...prev, msg]);
    setInput('');
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">Could not connect to session</p>
        <p className="text-red-400 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="border border-[#C9A84C] bg-[#FAF6EF] p-8 text-center">
        <div className="animate-pulse text-[#C9A84C] text-2xl mb-3">◎</div>
        <p className="text-black font-semibold">Connecting to session…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-black overflow-hidden min-h-[240px] p-4">
        {participants.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-white/60 text-sm">Waiting for facilitator to join…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {participants.map((p) => (
              <div key={p.identity} className="relative overflow-hidden bg-black/80 aspect-video">
                <video id={`video-${p.identity}`} autoPlay playsInline className="w-full h-full object-cover" />
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio id={`audio-${p.identity}`} autoPlay />
                <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-0.5">{p.name ?? p.identity}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-black/15 bg-white overflow-hidden">
        <div className="px-4 py-2 border-b border-black/10 bg-[#FAF6EF]">
          <span className="text-xs font-semibold text-black uppercase tracking-wide">Session Chat</span>
        </div>
        <div className="h-40 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && <p className="text-black/50 text-sm text-center">No messages yet</p>}
          {messages.map((m, i) => (
            <div key={i} className="text-sm"><span className="font-medium text-black">{m.sender}: </span><span className="text-black/80">{m.text}</span></div>
          ))}
        </div>
        <div className="flex gap-2 px-4 py-3 border-t border-black/10">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Type a message…"
            className="flex-1 text-sm border border-black/15 px-3 py-2 focus:outline-none focus:border-[#C9A84C]" />
          <button onClick={sendMessage} className="btn-primary text-sm px-4 py-2">Send</button>
        </div>
      </div>
    </div>
  );
}
