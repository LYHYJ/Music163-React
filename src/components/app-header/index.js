import React, { memo, useCallback, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';

import { debounce } from '@/utils/format-utils.js';
import { getSearchSongListAction,changeFocusStateAction } from './store/actionCreator';
import { headerLinks } from '@/common/local-data';
import { getSongDetailAction } from '@/pages/player/store'

import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { HeaderLeft, HeaderRight, HeaderWrapper } from './style';

export default memo(function JMAppHeader(props) {
  // props/state
  // const [isFocus, setIsFocus] = useState(false); // 是否获取焦点
  const [isRedirect, setIsRedirect] = useState(false);
  const [value, setValue] = useState('')

  // Header-Select-Item
  const showSelectItem = (item, index) => {
    if (index < 3) {
      return (
        <NavLink
          key={item.title}
          to={item.link}
          className="header-item"
          activeClassName="link-active"
        >
          <em>{item.title}</em>
          <i className="icon"></i>
        </NavLink>
      );
    } else {
      return (
        <a href={item.link} key={item.title} className="header-item">
          {item.title}
        </a>
      );
    }
  };

  // redux hook
  const dispatch = useDispatch();
  const { searchSongList, focusState } = useSelector((state) => ({
    searchSongList: state.getIn(['themeHeader', 'searchSongList']),
    focusState: state.getIn(['themeHeader', 'focusState'])
  }), shallowEqual);


  // other function debounce()  函数防抖进行优化
  const changeInput = debounce((target) => {
    let value = target.value.trim();
    if(value.length < 1) return
    // 显示下拉框
    dispatch(changeFocusStateAction(true))
    // 发送网络请求
    dispatch(getSearchSongListAction(value));
  }, 400);
  // 点击当前item歌曲项
  const changeCurrentSong = (id) => {
    //派发action
    dispatch(getSongDetailAction(id))
    // 隐藏下拉框
    dispatch(changeFocusStateAction(false))
    // 播放音乐
    document.getElementById('audio').autoplay = true
  }
  // 跳转到搜索详情
  const handleEnter = useCallback((e) => {
    setIsRedirect(true)
  }, [])

  // 返回的JSX
  return (
    <HeaderWrapper>
      <div className="content w1100">
        <HeaderLeft>
          <h1>
            <a href="#/" className="logo sprite_01">
              网易云音乐
            </a>
          </h1>
          <div className="header-group">
            {headerLinks.map((item, index) => {
              return showSelectItem(item, index);
            })}
          </div>
        </HeaderLeft>
        <HeaderRight>
          <div className="search-wrapper">
            <Input
              className="search"
              placeholder="音乐/视频/电台/用户"
              prefix={<SearchOutlined />}
              onChange={(e) => setIsRedirect(false) || setValue(e.target.value)}
              onInput={({ target }) => changeInput(target)}
              onFocus={() => dispatch(changeFocusStateAction(true)) }
              onPressEnter={(e) => handleEnter(e)}
              value={value}
            />
            {isRedirect && <Redirect to={{pathname: '/search', search: `?song=${value}&type=1`}} />}
            <div
              className="down-slider"
              style={{ display: focusState ? 'block' : 'none' }}
            >
              <div className="search-header">
                <span className="discover">搜"歌曲"相关用户&gt;</span>
              </div>

              <div className="content">
                <div className="zuo">
                  <span className="song">单曲</span>
                </div>

                <div className="you">
                  <span className="main">
                    {
                      searchSongList&&searchSongList.map((item) => {
                        return (
                          <div className="item" key={item.id} onClick={() => changeCurrentSong(item.id)}>
                            <span>{item.name}</span>-{item.artists[0].name}
                          </div>
                        ) 
                      })
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="center">创作者中心</div>
          <div>登录</div>
        </HeaderRight>
      </div>
      <div className="red-line"></div>
    </HeaderWrapper>
  );
});
