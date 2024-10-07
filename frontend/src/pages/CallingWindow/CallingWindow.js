import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useRoomContext,
    useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useEffect, useState } from 'react';

const CallingWindow = () => {
    const [callToken, setCallToken] = useState('');

    useEffect(() => {
        window.addEventListener('message', (event) => {
            const { token } = event.data;
            setCallToken(token);
        });
    }, []);

    return (
        <div className="position-fixed top-0 bottom-0 start-0 end-0" style={{ zIndex: 9999999999 }}>
            <LiveKitRoom
                video={false}
                audio={false}
                token={callToken}
                serverUrl={import.meta.env.VITE_NEXT_PUBLIC_LK_SERVER_URL}
                data-lk-theme="default"
                style={{ height: '100vh' }}
            >
                <MyVideoConference />
                <RoomAudioRenderer />
                <ControlBar />
            </LiveKitRoom>
        </div>
    );
};

function MyVideoConference() {
    const room = useRoomContext();

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );

    useEffect(() => {
        if (room) {
            room.on('disconnected', () => {
                if (window.opener) {
                    window.close();
                }
            });
        }

        return () => {
            room?.off('disconnected');
        };
    }, [room]);
    return (
        <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
            <ParticipantTile />
        </GridLayout>
    );
}

export default CallingWindow;
