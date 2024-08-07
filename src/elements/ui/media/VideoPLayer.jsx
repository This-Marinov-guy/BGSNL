
import React from 'react';
import YouTube from 'react-youtube';
import useBreakdown from '../../../hooks/use-breakdown';

const VideoPlayer = ({ src }) => {
    const onPlayerReady = (event) => {
        // Access to player in all event handlers via event.target
        event.target.playVideo();
    };

    const breakdown = useBreakdown();

    let index;
    switch (breakdown) {
        case 'lg':
            index = 1.8;
            break;
        case 'md':
            index = 1.4;
            break;
        default:
            index = 1.2;
    }

    const width = window.innerWidth / index;
    const height = width / 16 * 9;

    const opts = {
        height,
        width,
        playerVars: {
            autoplay: 1,
        },
    };

    return (
        <div className="video-container">
            <YouTube videoId={src} opts={opts} onReady={onPlayerReady} className="youtube-player" />
        </div>
    );
};

export default VideoPlayer;