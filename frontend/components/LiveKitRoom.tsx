"use client";

import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";

export default function Room({
  token,
  onDisconnect
}: {
  token: string;
  onDisconnect: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="w-full h-full relative">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://192.168.1.40:7880"}
          onDisconnected={onDisconnect}
          // Set to default theme
          className="h-full w-full"
        >
          {/* Active video layout block */}
          <div className="flex-1 h-full w-full bg-background flex flex-col p-4 gap-4 relative overflow-hidden dark">
             
            {/* Tech grid wrapper for the video */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
             
            <div className="relative z-10 w-full h-full p-2 border border-primary/20 rounded-xl shadow-lg bg-card/50 backdrop-blur-sm">
              <MyVideoConference />
            </div>
            
            {/* Elegant transparent control bar anchored to the bottom */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 backdrop-blur-2xl bg-card/80 border border-primary/40 px-8 py-3 rounded-2xl shadow-xl z-20">
              <ControlBar variation="minimal" />
            </div>
            
            <RoomAudioRenderer />
          </div>
        </LiveKitRoom>
      </div>
    </div>
  );
}

function MyVideoConference() {
  // Find all active tracks including camera and screen share
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="w-full h-full pb-20"> 
      {/* Provides some bottom padding so videos don't get covered by ControlBar */}
      <GridLayout tracks={tracks} style={{ height: "100%" }}>
        <ParticipantTile />
      </GridLayout>
    </div>
  );
}