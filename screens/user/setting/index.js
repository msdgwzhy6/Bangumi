/*
 * @Author: czy0729
 * @Date: 2019-05-24 01:34:26
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-07 02:45:08
 */
import React from 'react'
import { ScrollView } from 'react-native'
import { Switch } from '@ant-design/react-native'
import { Text } from '@components'
import { Popover, ItemSetting } from '@screens/_'
import Stores, { userStore, systemStore } from '@stores'
import { withHeader, observer } from '@utils/decorators'
import { info } from '@utils/ui'
import { appNavigate } from '@utils/app'
import { hm } from '@utils/fetch'
import {
  IOS,
  FEEDBACK_URL,
  GITHUB_URL,
  GITHUB_RELEASE_URL,
  GITHUB_RELEASE_VERSION,
  CODE_PUSH_VERSION,
  USERID_TOURIST,
  USERID_IOS_AUTH
} from '@constants'
import { MODEL_SETTING_QUALITY } from '@constants/model'
import _ from '@styles'

export default
@withHeader()
@observer
class Setting extends React.Component {
  static navigationOptions = {
    title: '设置'
  }

  state = {
    showDev: false
  }

  componentDidMount() {
    const { navigation } = this.props

    if (this.showQiafan) {
      navigation.setParams({
        popover: {
          data: ['鼓励(恰饭)'],
          onSelect: key => {
            switch (key) {
              case '鼓励(恰饭)':
                navigation.push('Qiafan')
                break
              case '开发模式':
                this.toggleDev()
                break
              default:
                break
            }
          }
        }
        // element: (
        //   <View
        //     style={{
        //       width: 32,
        //       height: 32
        //     }}
        //   />
        // )
      })
    }

    hm('settings')
  }

  setQuality = label => {
    if (label) {
      systemStore.setQuality(label)
    }
  }

  toggleDev = () => {
    const { showDev } = this.state
    this.setState({
      showDev: !showDev
    })
    info(`调式模式 ${!showDev ? '开' : '关'}`)
    systemStore.toggleDev()
  }

  get userId() {
    return userStore.userInfo.id
  }

  get isLogin() {
    return userStore.isLogin
  }

  get showQiafan() {
    if (!IOS) {
      return true
    }

    if (!this.isLogin) {
      return false
    }

    if (
      !this.userId ||
      this.userId == USERID_TOURIST ||
      this.userId == USERID_IOS_AUTH
    ) {
      return false
    }

    return true
  }

  render() {
    const { navigation } = this.props
    const {
      quality,
      cnFirst,
      autoFetch,
      speech,
      tinygrail,
      avatarRound,
      heatMap
    } = systemStore.setting
    const { name } = systemStore.release
    const hasNewVersion = name !== GITHUB_RELEASE_VERSION
    let version = GITHUB_RELEASE_VERSION
    if (CODE_PUSH_VERSION) {
      version += ` (${CODE_PUSH_VERSION})`
    }
    return (
      <ScrollView
        style={_.container.screen}
        contentContainerStyle={_.container.bottom}
      >
        <Text style={[_.container.wind, _.mt.md]} type='sub'>
          基本
        </Text>
        <ItemSetting
          style={_.mt.sm}
          hd='图片质量'
          ft={
            <Popover
              data={MODEL_SETTING_QUALITY.data.map(({ label }) => label)}
              onSelect={this.setQuality}
            >
              <Text size={16} type='sub'>
                {MODEL_SETTING_QUALITY.getLabel(quality)}
              </Text>
            </Popover>
          }
          arrow
          highlight
        />
        <ItemSetting
          border
          hd='优先中文'
          ft={<Switch checked={cnFirst} onChange={systemStore.switchCnFirst} />}
          withoutFeedback
        />

        <ItemSetting
          border
          hd='优化请求量 (实验性)'
          ft={
            <Switch
              checked={!autoFetch}
              onChange={systemStore.switchAutoFetch}
            />
          }
          withoutFeedback
        />
        <ItemSetting
          border
          hd='小圣杯信息'
          ft={
            <Switch
              checked={tinygrail}
              onChange={systemStore.switchTinygrail}
            />
          }
          withoutFeedback
        />

        <Text style={[_.container.wind, _.mt.md]} type='sub'>
          界面
        </Text>
        <ItemSetting
          style={_.mt.sm}
          hd='Bangumi娘话语'
          ft={<Switch checked={speech} onChange={systemStore.switchSpeech} />}
          withoutFeedback
        />
        <ItemSetting
          border
          hd='圆形头像'
          ft={
            <Switch
              checked={avatarRound}
              onChange={systemStore.switchAvatarRound}
            />
          }
          withoutFeedback
        />
        <ItemSetting
          border
          hd='章节讨论热力图'
          ft={<Switch checked={heatMap} onChange={systemStore.switchHeatMap} />}
          withoutFeedback
        />

        <Text style={[_.container.wind, _.mt.md]} type='sub'>
          联系
        </Text>
        <ItemSetting
          style={_.mt.sm}
          hd='版本'
          ft={
            hasNewVersion && !IOS ? (
              <Text type='success' size={16}>
                有新版本{name}
                <Text type='sub' size={16}>
                  {' '}
                  / 当前{version}
                </Text>
              </Text>
            ) : (
              `当前版本${version}`
            )
          }
          arrow={!IOS}
          onPress={IOS ? undefined : () => appNavigate(GITHUB_RELEASE_URL)}
        />
        <ItemSetting
          border
          hd='问题反馈'
          arrow
          highlight
          onPress={() => appNavigate(FEEDBACK_URL, navigation)}
        />

        <ItemSetting
          border
          hd='项目地址'
          ft='喜欢的话求个Star'
          arrow
          highlight
          onPress={() => appNavigate(GITHUB_URL)}
        />

        <Text style={[_.container.wind, _.mt.md]} type='sub'>
          其他
        </Text>
        <ItemSetting
          style={_.mt.sm}
          hd='清除缓存'
          arrow
          highlight
          onPress={Stores.clearStorage}
        />
        <ItemSetting
          border
          hd={
            <Text size={16} type='danger'>
              退出登陆
            </Text>
          }
          arrow
          highlight
          onPress={() => Stores.logout(navigation)}
        />
      </ScrollView>
    )
  }
}
