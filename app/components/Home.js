// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Layout, Spin } from 'antd';
import styles from './Home.css';
import PlayerController from '../playerComponents/PlayerController';
import PlayListContainer from '../playerComponents/PlayListContainer';
import AudioListContainer from '../playerComponents/AudioListContainer';
import PlayModeContainer from '../playerComponents/PlayModeContainer';

const { Header, Sider, Footer, Content } = Layout;

export class Home extends Component {
  render() {
    return (
      <Layout style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header style={{ height: 60 }}>
          <PlayerController />
        </Header>
        <Layout>
          <Sider>
            <PlayListContainer />
          </Sider>
          <Content style={{ background: 'white' }}>
            <AudioListContainer />
          </Content>
        </Layout>
        <Footer style={{ height: 100 }}>
          <PlayModeContainer />
        </Footer>
      </Layout>
    );
  }
}

class HomeContainer extends Component {
  render() {
    const { tip = 'Loading', globalLoading } = this.props;
    return (
      <div className="home-container">
        <Spin tip={tip} spinning={globalLoading}>
          <Home />
        </Spin>
      </div>
    );
  }
}

export default connect(state => ({
  globalLoading: state.appStateChunk.globalLoading,
}))(HomeContainer);
