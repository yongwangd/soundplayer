import React from 'react';
import { Button, Slider, Icon } from 'antd';
import { connect } from 'react-redux';
import Rx from 'rxjs/Rx';
import { actions } from '../reducers/audioActionReducer';
import styles from '../components/Main.css';

class PlayerController extends React.Component {
  state = {
    currentTime: 0,
    duration: 0,
    playing: true,
  };
  componentDidMount() {
    setTimeout(() => {
      this.audioElm.volume = this.props.volume || 1;
    }, 400);
    this.timeUpdate$.subscribe(currentTime => this.setState({ currentTime }));
  }
  timeUpdate$ = new Rx.Subject()
    .map(() => Math.floor(this.audioElm.currentTime))
    .distinctUntilChanged();

  playClick = () => {
    this.audioElm.play();
    this.setState({ playing: true });
  };
  pauseClick = () => {
    this.audioElm.pause();
    this.setState({ playing: false });
  };
  render() {
    const {
      currentPlaying,
      playbackEnd,
      volume,
      setVolume,
      playNextAudio,
      playPreviousAudio,
    } = this.props;
    const { currentTime, duration, playing } = this.state;
    const { playClick, pauseClick } = this;
    return (
      <div>
        {!currentPlaying && <div>No Source</div>}
        {currentPlaying && (
          <div style={{ display: 'flex' }}>
            <div
              style={{
                width: 200,
                background: 'gray',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 60,
              }}
            >
              <Icon
                type="step-backward"
                onClick={playPreviousAudio}
                className={styles.playIconSmall}
              />
              <Icon type="pause" onClick={pauseClick} />
              <Icon type="caret-right" onClick={playClick} />
              <Icon type="step-forward" onClick={playNextAudio} />
            </div>
            <div style={{ background: 'white', alignItems: 'center', display: 'flex' }}>
              <Slider
                min={0}
                max={duration}
                value={currentTime}
                step={1}
                onChange={v => {
                  console.log(this.audioElm.played);
                  this.audioElm.currentTime = v;
                }}
                style={{ width: 500 }}
              />
              <span>{`${currentTime}/${duration}`}</span>
              <Icon type="sound" style={{ fontSize: 15 }} />
              <Slider
                min={0}
                max={1}
                value={volume}
                step={0.01}
                onChange={v => {
                  setVolume(v);
                  this.audioElm.volume = v;
                  console.log(this.audioElm.played);
                }}
                tipFormatter={v => `${Math.floor(v * 100)}%`}
                style={{ flex: 1, width: 80 }}
              />
            </div>
          </div>
        )}

        {currentPlaying && (
          <span>
            {currentTime}
            <span>--dura--{duration}</span>
            <Button onClick={playPreviousAudio}>Previous</Button>
            <Button onClick={playNextAudio}>Next</Button>
            <Button onClick={() => this.audioElm.pause()}>pause</Button>
            <Button onClick={() => this.audioElm.play()}>play</Button>
            {currentPlaying.title} --- {currentPlaying.artist}{' '}
          </span>
        )}
        {currentPlaying && (
          <audio
            ref={elm => (this.audioElm = elm)}
            onEnded={playbackEnd}
            onLoadedMetadata={e =>
              this.setState({ duration: Math.floor(e.nativeEvent.target.duration) })}
            onTimeUpdate={e => this.timeUpdate$.next(e.nativeEvent.target.currentTIme)}
            controls="controls"
            autoPlay
            src={`file://${currentPlaying.path}`}
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    currentPlaying: state.audioChunk.currentPlaying,
    volume: state.audioChunk.volume,
  }),
  dispatch => ({
    playbackEnd: () => dispatch(actions.playbackEnd()),
    playNextAudio: () => dispatch(actions.playNextAudio()),
    playPreviousAudio: () => dispatch(actions.playPreviousAudio()),
    setVolume: volume => dispatch(actions.setVolume(volume)),
  }),
)(PlayerController);
