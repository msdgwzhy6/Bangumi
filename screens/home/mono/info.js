/*
 * @Author: czy0729
 * @Date: 2019-05-11 17:19:56
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-22 02:27:53
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import {
  Flex,
  Text,
  Image,
  HeaderPlaceholder,
  RenderHtml,
  Divider,
  Touchable,
  Iconfont,
  Loading
} from '@components'
import { SectionTitle } from '@screens/_'
import { IOS } from '@constants'
import _ from '@styles'
import TinygrailUsers from './tinygrail-users'
import Voice from './voice'
import Works from './works'
import Jobs from './jobs'

const maxSize = _.window.width - _.wind * 2

function Info(props, { $, navigation }) {
  const {
    name,
    nameCn,
    cover,
    info,
    detail,
    collectUrl,
    eraseCollectUrl,
    _loaded
  } = $.mono
  const { monoId, _name, _image } = $.params
  return (
    <>
      {!IOS && <HeaderPlaceholder />}
      <View style={[_.container.inner, styles.container]}>
        <Flex align='start'>
          <Flex.Item>
            <Flex align='baseline'>
              <Text size={20} bold>
                {name}
                <Text type='sub' lineHeight={20}>
                  {' '}
                  {nameCn || _name}
                </Text>
              </Text>
            </Flex>
          </Flex.Item>
          {!!collectUrl && (
            <Touchable style={_.ml.sm} onPress={$.doCollect}>
              <Flex>
                <Iconfont size={14} name='like' color={_.colorMain} />
                <Text style={_.ml.xs} lineHeight={22} type='sub'>
                  加入收藏
                </Text>
              </Flex>
            </Touchable>
          )}
          {!!eraseCollectUrl && (
            <Touchable style={_.ml.sm} onPress={$.doEraseCollect}>
              <Flex>
                <Iconfont size={14} name='like-full' color={_.colorDanger} />
                <Text style={_.ml.xs} type='danger'>
                  已收藏
                </Text>
              </Flex>
            </Touchable>
          )}
        </Flex>
        {!_loaded && (
          <Flex style={styles.loading} justify='center'>
            <Loading />
          </Flex>
        )}
        {!!cover && (
          <Flex style={_.mt.md} justify='center'>
            <Image
              src={cover || _image}
              autoSize={maxSize}
              border
              shadow
              placholder={false}
              imageViewer
            />
          </Flex>
        )}
        <TinygrailUsers style={_.mt.lg} />
        {!!info && <RenderHtml style={[styles.info, _.mt.md]} html={info} />}
        {!!detail && <RenderHtml style={_.mt.lg} html={detail} />}
      </View>
      <Divider />
      <Voice style={_.mt.md} />
      <Works style={_.mt.md} />
      <Jobs style={_.mt.md} />
      <SectionTitle
        style={[styles.title, _.mt.lg, _.mb.md]}
        right={
          <Touchable
            onPress={() => {
              const type = monoId.includes('character/') ? 'crt' : 'prsn'
              navigation.push('Topic', {
                topicId: `${type}/${monoId.match(/\d+/g)[0]}`
              })
            }}
          >
            <Flex>
              <Text type='sub'>去吐槽</Text>
              <Iconfont name='right' size={16} />
            </Flex>
          </Touchable>
        }
      >
        吐槽箱
      </SectionTitle>
    </>
  )
}

Info.contextTypes = {
  $: PropTypes.object,
  navigation: PropTypes.object
}

export default observer(Info)

const styles = StyleSheet.create({
  container: {
    minHeight: _.window.height * 0.56
  },
  loading: {
    minHeight: _.window.height * 0.48
  },
  info: {
    paddingHorizontal: _.wind
  },
  title: {
    paddingHorizontal: _.wind
  }
})
