/*
 * @Author: czy0729
 * @Date: 2019-10-19 21:28:24
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-20 18:16:34
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Flex, Iconfont, Image, Text, Touchable } from '@components'
import { Eps } from '@screens/_'
import { getCoverMedium } from '@utils/app'
import { MODEL_SUBJECT_TYPE } from '@constants/model'
import _ from '@styles'

class GridInfo extends React.Component {
  static defaultProps = {
    subjectId: 0,
    subject: {},
    epStatus: ''
  }

  static contextTypes = {
    $: PropTypes.object,
    navigation: PropTypes.object
  }

  onPress = () => {
    const { navigation } = this.context
    const { subjectId, subject } = this.props
    navigation.push('Subject', {
      subjectId,
      _jp: subject.name,
      _cn: subject.name_cn || subject.name,
      _image: getCoverMedium(subject.images.medium)
    })
  }

  renderBtnNextEp() {
    const { $ } = this.context
    const { subjectId } = this.props
    const { sort } = $.nextWatchEp(subjectId)
    if (!sort) {
      return null
    }

    return (
      <Touchable
        style={styles.touchable}
        onPress={() => $.doWatchedNextEp(subjectId)}
      >
        <Flex justify='center'>
          <Iconfont style={styles.icon} name='check' size={16} />
          <View style={[styles.placeholder, _.ml.sm]}>
            <Text type='sub' size={12}>
              {sort}
            </Text>
          </View>
        </Flex>
      </Touchable>
    )
  }

  renderToolBar() {
    const { $ } = this.context
    const { subjectId } = this.props
    return (
      <Flex>
        {this.renderBtnNextEp()}
        <Touchable
          style={[styles.touchable, _.ml.sm]}
          onPress={() => $.showManageModal(subjectId)}
        >
          <Iconfont name='star' size={16} />
        </Touchable>
      </Flex>
    )
  }

  renderCount() {
    const { $ } = this.context
    const { subjectId, subject, epStatus } = this.props
    const label = MODEL_SUBJECT_TYPE.getTitle(subject.type)
    if (label === '书籍') {
      const { list = [] } = $.userCollection
      const { ep_status: epStatus, vol_status: volStatus } = list.find(
        item => item.subject_id === subjectId
      )
      return (
        <Flex>
          <Flex align='baseline'>
            <Text type='primary' size={10} lineHeight={1}>
              Chap.
            </Text>
            <Text style={_.ml.xs} type='primary' size={18} lineHeight={1}>
              {epStatus}
            </Text>
            <Text style={_.ml.xs} type='sub' size={10} lineHeight={1}>
              / ?
            </Text>
          </Flex>
          {this.renderBookNextBtn(subjectId, epStatus + 1, volStatus)}
          <Flex style={_.ml.md} align='baseline'>
            <Text type='primary' size={10} lineHeight={1}>
              Vol.
            </Text>
            <Text style={_.ml.xs} type='primary' size={18} lineHeight={1}>
              {volStatus}
            </Text>
            <Text style={_.ml.xs} type='sub' size={10} lineHeight={1}>
              / ?
            </Text>
          </Flex>
          {this.renderBookNextBtn(subjectId, epStatus, volStatus + 1)}
        </Flex>
      )
    }

    return (
      <Flex align='baseline'>
        <Text type='primary' size={18} lineHeight={1}>
          {epStatus || 1}
        </Text>
        <Text style={_.ml.xs} type='sub' size={10} lineHeight={1}>
          / {subject.eps_count || '?'}
        </Text>
      </Flex>
    )
  }

  renderBookNextBtn(subjectId, epStatus, volStatus) {
    const { $ } = this.context
    return (
      <Touchable
        style={styles.touchable}
        onPress={() => $.doUpdateNext(subjectId, epStatus, volStatus)}
      >
        <Flex justify='center'>
          <Iconfont style={styles.icon} name='check' size={16} />
        </Flex>
      </Touchable>
    )
  }

  render() {
    const { $, navigation } = this.context
    const { subjectId, subject } = this.props
    const isToday = $.isToday(subjectId)
    const isBook = MODEL_SUBJECT_TYPE.getTitle(subject.type) === '书籍'
    const doing = isBook ? '读' : '看'
    return (
      <Flex style={styles.item} align='start'>
        <Image
          size={120}
          height={168}
          src={getCoverMedium(subject.images.medium)}
          radius
          border={_.colorBorder}
          shadow
          onPress={this.onPress}
        />
        <Flex.Item style={[_.ml.wind, _.mt.xs]}>
          <Touchable onPress={this.onPress}>
            <Flex align='start'>
              <Flex.Item>
                <Text numberOfLines={1}>{subject.name_cn || subject.name}</Text>
              </Flex.Item>
              {isToday && (
                <Text style={_.ml.sm} type='success' size={12} lineHeight={14}>
                  放送中
                </Text>
              )}
            </Flex>
          </Touchable>
          <Text style={_.mt.xs} type='sub' size={11}>
            {subject.collection.doing} 人在{doing}
          </Text>
          <Flex style={_.mt.sm}>
            <Flex.Item>{this.renderCount()}</Flex.Item>
            {this.renderToolBar()}
          </Flex>
          <Eps
            style={_.mt.sm}
            numbersOfLine={6}
            login={$.isLogin}
            subjectId={subjectId}
            eps={$.eps(subjectId)}
            userProgress={$.userProgress(subjectId)}
            onSelect={(value, item, subjectId) =>
              $.doEpsSelect(value, item, subjectId, navigation)
            }
            onLongPress={item => $.doEpsLongPress(item, subjectId)}
          />
        </Flex.Item>
      </Flex>
    )
  }
}

export default observer(GridInfo)

const styles = StyleSheet.create({
  item: {
    paddingVertical: 16,
    paddingHorizontal: _.sm
  },
  icon: {
    marginBottom: -1
  },
  touchable: {
    padding: _.sm
  }
})
