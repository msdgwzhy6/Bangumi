/*
 * @Author: czy0729
 * @Date: 2019-03-18 05:01:50
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-08-10 21:05:32
 */
import React from 'react'
import { StyleSheet, ScrollView, View } from 'react-native'
import { observer } from 'mobx-react'
import { ActivityIndicator, Modal } from '@ant-design/react-native'
import { Button, Flex, Input, Text, Touchable } from '@components'
import { collectionStore, subjectStore } from '@stores'
import { MODEL_PRIVATE } from '@constants/model'
import _ from '@styles'
import StarGroup from './star-group'
import StatusBtnGroup from './status-btn-group'

const initState = {
  focus: false,
  loading: true,
  doing: false,
  fetching: false,
  rating: 0,
  tags: '',
  comment: '',
  status: '',
  privacy: MODEL_PRIVATE.getValue('公开')
}

class ManageModal extends React.Component {
  static defaultProps = {
    visible: false,
    subjectId: 0,
    title: '',
    desc: '',
    action: '看',
    onSubmit: Function.prototype,
    onClose: Function.prototype
  }

  state = initState

  async componentWillReceiveProps(nextProps) {
    const { visible, subjectId } = nextProps
    if (visible) {
      if (!this.props.visible) {
        this.setState({
          loading: false
        })

        const {
          rating,
          tag = [],
          comment,
          private: privacy,
          status = {}
        } = await collectionStore.fetchCollection(subjectId)
        this.setState({
          rating,
          tags: tag.join(' '),
          comment,
          status: status.type,
          privacy
        })
      }
    } else {
      // <Modal>有渐出动画
      setTimeout(() => {
        this.setState(initState)
      }, 400)
    }
  }

  changeRating = value => {
    this.setState({
      rating: value
    })
  }

  changeText = (name, text) => {
    this.setState({
      [name]: text
    })
  }

  changeStatus = status => {
    this.setState({
      status
    })
  }

  toggleTag = name => {
    const { tags } = this.state
    const selected = tags.split(' ')
    const index = selected.indexOf(name)
    if (index === -1) {
      selected.push(name)
    } else {
      selected.splice(index, 1)
    }

    this.setState({
      tags: selected.join(' ')
    })
  }

  togglePrivacy = () => {
    const { privacy } = this.state
    const label = MODEL_PRIVATE.getLabel(privacy)
    this.setState({
      privacy: MODEL_PRIVATE.getValue(label === '公开' ? '私密' : '公开')
    })
  }

  fetchTags = async () => {
    const { subjectId } = this.props
    this.setState({
      fetching: true
    })
    await subjectStore.fetchSubjectFormHTML(subjectId)

    this.setState({
      fetching: false
    })
  }

  onFocus = () => {
    this.setState({
      focus: true
    })
  }

  onBlur = () => {
    this.setState({
      focus: false
    })
  }

  onSubmit = async () => {
    const { subjectId, onSubmit } = this.props
    const { rating, tags, comment, status, privacy } = this.state
    this.setState({
      doing: true
    })
    await onSubmit({
      subjectId,
      rating,
      tags,
      status,
      privacy,
      comment: comment || ''
    })

    this.setState({
      doing: false
    })
  }

  get subjectFormHTML() {
    const { subjectId } = this.props
    return subjectStore.subjectFormHTML(subjectId)
  }

  renderTags() {
    const { fetching } = this.state
    if (fetching) {
      return (
        <View style={_.ml.xs}>
          <ActivityIndicator />
        </View>
      )
    }

    const { _loaded, tags } = this.subjectFormHTML
    if (!_loaded) {
      return (
        <Touchable style={_.ml.xs} onPress={this.fetchTags}>
          <Text size={13} underline>
            点击获取大家的标注
          </Text>
        </Touchable>
      )
    }

    const selected = this.state.tags.split(' ')
    return (
      <ScrollView horizontal>
        {tags.map(({ name, count }) => (
          <Touchable
            key={name}
            withoutFeedback
            onPress={() => this.toggleTag(name)}
          >
            <Flex
              style={[
                styles.tag,
                selected.indexOf(name) !== -1 && styles.tagSelected
              ]}
            >
              <Text size={13}>{name}</Text>
              <Text style={_.ml.xs} type='sub' size={13}>
                {count}
              </Text>
            </Flex>
          </Touchable>
        ))}
      </ScrollView>
    )
  }

  render() {
    const { visible, title, desc, action, onClose } = this.props
    const {
      focus,
      loading,
      doing,
      rating,
      tags,
      comment,
      status,
      privacy
    } = this.state
    return (
      <Modal
        style={[styles.modal, focus && styles.focus]}
        visible={visible}
        title={
          <Text type='title' size={16}>
            {title}
          </Text>
        }
        transparent
        maskClosable
        closable
        onClose={onClose}
      >
        <Text style={_.mt.sm} type='sub' size={12} align='center'>
          {desc}
        </Text>
        <Flex style={[styles.wrap, _.mt.sm]} justify='center'>
          {loading ? (
            <ActivityIndicator size='small' />
          ) : (
            <Flex style={styles.content} direction='column'>
              <StarGroup value={rating} onChange={this.changeRating} />
              <Input
                style={_.mt.md}
                defaultValue={tags}
                placeholder='我的标签'
                onChangeText={text => this.changeText('tags', text)}
              />
              <Flex style={styles.tags}>{this.renderTags()}</Flex>
              <Input
                style={_.mt.xs}
                defaultValue={comment}
                placeholder='吐槽点什么'
                multiline
                numberOfLines={4}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onChangeText={text => this.changeText('comment', text)}
              />
              <StatusBtnGroup
                style={_.mt.md}
                value={status}
                action={action}
                onSelect={this.changeStatus}
              />
              <Flex style={_.mt.md}>
                <Flex.Item>
                  <Button type='main' loading={doing} onPress={this.onSubmit}>
                    更新收藏状态
                  </Button>
                </Flex.Item>
                <Button
                  style={[styles.btnEye, _.ml.sm]}
                  type='ghostMain'
                  onPress={this.togglePrivacy}
                >
                  {MODEL_PRIVATE.getLabel(privacy)}
                </Button>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Modal>
    )
  }
}

export default observer(ManageModal)

const styles = StyleSheet.create({
  modal: {
    width: _.window.width - 2 * _.wind,
    backgroundColor: _.colorBg
  },
  focus: {
    marginTop: -_.window.height * 0.32
  },
  wrap: {
    height: 380
  },
  content: {
    width: '100%',
    maxWidth: _.window.maxWidth,
    paddingBottom: _.sm
  },
  tags: {
    width: '100%',
    height: 54,
    paddingVertical: 12
  },
  tag: {
    paddingVertical: _.xs,
    paddingHorizontal: _.sm,
    marginRight: _.sm,
    backgroundColor: _.colorBg,
    borderWidth: 1,
    borderColor: _.colorBorder,
    borderRadius: _.radiusXs
  },
  tagSelected: {
    backgroundColor: _.colorPrimaryLight,
    borderColor: _.colorPrimaryBorder
  },
  btnEye: {
    width: 70
  }
})
