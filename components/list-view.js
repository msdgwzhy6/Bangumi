/*
 * @Author: czy0729
 * @Date: 2019-04-11 00:46:28
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-04-28 22:53:22
 */
import React from 'react'
import {
  FlatList,
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import { LIST_EMPTY } from '@constants'
import { sleep } from '@utils'
import { window, colorSub } from '@styles'
import Activity from './activity'
import Text from './text'
import HeaderPlaceholder from './header-placeholder'

const RefreshState = {
  Idle: 0,
  HeaderRefreshing: 1,
  FooterRefreshing: 2,
  NoMoreData: 3,
  Failure: 4,
  EmptyData: 5
}

export default class ListView extends React.Component {
  static defaultProps = {
    style: undefined,
    keyExtractor: undefined,
    data: LIST_EMPTY,
    sectionKey: '', // 当有此值, 根据item[section]构造<SectionList>的sections
    sections: undefined,
    progressViewOffset: undefined,
    renderItem: undefined,
    footerRefreshingText: '玩命加载中 >.<',
    footerFailureText: '我擦嘞，居然失败了 =.=!',
    footerNoMoreDataText: '- 没有更多啦 -',
    footerEmptyDataText: '- 好像什么东西都没有 -',
    onHeaderRefresh: undefined,
    onFooterRefresh: undefined
  }

  state = {
    refreshState: RefreshState.Idle
  }

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps
    const { list = [], pagination = {}, _loaded } = data
    let refreshState

    if (!_loaded) {
      refreshState = RefreshState.Idle
    } else if (list.length === 0) {
      refreshState = RefreshState.EmptyData
    } else if (pagination.page < pagination.pageTotal) {
      refreshState = RefreshState.Idle
    } else {
      refreshState = RefreshState.NoMoreData
    }

    if (refreshState !== undefined) {
      this.setState({
        refreshState
      })
    }
  }

  scrollTo = Function.prototype
  scrollToLocation = Function.prototype

  onHeaderRefresh = async () => {
    const { onHeaderRefresh } = this.props
    if (onHeaderRefresh) {
      this.setState({
        refreshState: RefreshState.HeaderRefreshing
      })
      await sleep(800)
      onHeaderRefresh()
    }
  }

  onFooterRefresh = async () => {
    const { onFooterRefresh } = this.props
    if (onFooterRefresh) {
      this.setState({
        refreshState: RefreshState.FooterRefreshing
      })
      await sleep(800)
      onFooterRefresh()
    }
  }

  onEndReached = () => {
    if (this.shouldStartFooterRefreshing()) {
      this.onFooterRefresh()
    }
  }

  shouldStartHeaderRefreshing = () => {
    const { refreshState } = this.state
    if (
      refreshState == RefreshState.HeaderRefreshing ||
      refreshState == RefreshState.FooterRefreshing
    ) {
      return false
    }
    return true
  }

  shouldStartFooterRefreshing = () => {
    const { refreshState } = this.state
    return refreshState === RefreshState.Idle
  }

  renderFooter = refreshState => {
    let footer = null
    const {
      data,
      footerRefreshingText,
      footerFailureText,
      footerNoMoreDataText,
      footerEmptyDataText,
      footerRefreshingComponent,
      footerFailureComponent,
      footerNoMoreDataComponent,
      footerEmptyDataComponent,
      onHeaderRefresh,
      onFooterRefresh
    } = this.props
    switch (refreshState) {
      case RefreshState.Idle:
        footer = <View style={styles.footerContainer} />
        break
      case RefreshState.Failure:
        footer = (
          <TouchableOpacity
            onPress={() => {
              if (data.list.length === 0) {
                if (onHeaderRefresh) {
                  onHeaderRefresh(RefreshState.HeaderRefreshing)
                }
              } else if (onFooterRefresh) {
                onFooterRefresh(RefreshState.FooterRefreshing)
              }
            }}
          >
            {footerFailureComponent || (
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>{footerFailureText}</Text>
              </View>
            )}
          </TouchableOpacity>
        )
        break
      case RefreshState.EmptyData:
        footer = (
          <TouchableOpacity
            onPress={() => {
              if (onHeaderRefresh) {
                onHeaderRefresh(RefreshState.HeaderRefreshing)
              }
            }}
          >
            {footerEmptyDataComponent || (
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>{footerEmptyDataText}</Text>
              </View>
            )}
          </TouchableOpacity>
        )
        break
      case RefreshState.FooterRefreshing:
        footer = footerRefreshingComponent || (
          <View style={styles.footerContainer}>
            <Activity size='small' />
            <Text style={[styles.footerText, { marginLeft: 8 }]}>
              {footerRefreshingText}
            </Text>
          </View>
        )
        break
      case RefreshState.NoMoreData:
        footer = footerNoMoreDataComponent || (
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>{footerNoMoreDataText}</Text>
          </View>
        )
        break
      default:
        break
    }
    return footer
  }

  render() {
    const {
      style,
      data,
      sectionKey,
      sections,
      progressViewOffset,
      ...other
    } = this.props
    const { refreshState } = this.state
    const commonProps = {
      ref: ref => {
        if (ref) {
          this.scrollToLocation = params => ref.scrollToLocation(params)
        }
      },
      style: [styles.container, style],
      initialNumToRender: 10,
      refreshing: refreshState === RefreshState.HeaderRefreshing,
      refreshControl: (
        <RefreshControl
          title={
            typeof data._loaded === 'string'
              ? `上次刷新时间: ${data._loaded}`
              : undefined
          }
          titleColor={colorSub}
          progressViewOffset={progressViewOffset}
          refreshing={refreshState === RefreshState.HeaderRefreshing}
          onRefresh={this.onHeaderRefresh}
        />
      ),
      ListFooterComponent: this.renderFooter(refreshState),
      onRefresh: this.onHeaderRefresh,
      onEndReached: this.onEndReached,
      onEndReachedThreshold: 0.16
    }

    if (sectionKey || sections) {
      let _sections = []
      if (sections) {
        _sections = sections.slice()
      } else {
        const sectionsMap = {}
        data.list.slice().forEach(item => {
          const title = item[sectionKey]
          if (sectionsMap[title] === undefined) {
            sectionsMap[title] = _sections.length
            _sections.push({
              title,
              data: [item]
            })
          } else {
            _sections[sectionsMap[title]].data.push(item)
          }
        })
      }
      return <SectionList sections={_sections} {...commonProps} {...other} />
    }

    return <FlatList data={data.list.slice()} {...commonProps} {...other} />
  }
}

const styles = StyleSheet.create({
  container: {
    minHeight: window.height * 0.24
  },
  footerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    height: 40
  },
  footerText: {
    fontSize: 14,
    color: colorSub
  }
})