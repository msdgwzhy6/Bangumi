/*
 * @Author: czy0729
 * @Date: 2019-03-15 02:19:02
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-02 00:23:42
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { observer } from 'mobx-react'
import { Carousel } from '@ant-design/react-native'
import { Flex, Popover, Menu, Button, Text } from '@components'
import { systemStore } from '@stores'
import { arrGroup } from '@utils'
import { IOS } from '@constants'
import { MODEL_EP_TYPE } from '@constants/model'
import _ from '@styles'

export default
@observer
class Eps extends React.Component {
  static defaultProps = {
    numbersOfLine: 8, // 1行多少个, 为了美观, 通过计算按钮占满1行
    pagination: false, // 是否分页, 1页4行按钮, 不分页显示1页, 分页会显示Carousel
    advance: false, // 详情页模式, 显示SP和更多的操作按钮
    login: false, // 是否已登陆
    subjectId: 0, // 条目Id
    canPlay: false, // 有播放源
    eps: [], // 章节数据
    userProgress: {}, // 用户收藏记录
    onSelect: Function.prototype, // 操作选择
    onLongPress: Function.prototype // 按钮长按
  }

  static pageLimit = 32 // 1页32个

  state = {
    width: 0
  }

  onLayout = ({ nativeEvent }) => {
    const { width } = this.state
    if (!width) {
      this.setState({
        width: nativeEvent.layout.width
      })
    }
  }

  onSelect = (value, item) => {
    const { subjectId, onSelect } = this.props
    onSelect(value, item, subjectId)
  }

  get style() {
    const { width } = this.state
    const { numbersOfLine } = this.props
    if (!width) {
      return {}
    }

    const marginPercent = 0.24
    const marginNumbers = numbersOfLine - 1
    const marginSum = width * marginPercent
    const widthSum = width - marginSum

    return {
      width: Math.floor(widthSum / numbersOfLine),
      margin: Math.floor(marginSum / marginNumbers)
    }
  }

  get commentMin() {
    const { eps } = this.props
    return Math.min(
      ...eps.map(item => item.comment || 1).filter(item => !!item)
    )
  }

  get commentMax() {
    const { eps } = this.props
    return Math.max(...eps.map(item => item.comment || 1))
  }

  getPopoverData = item => {
    const { canPlay, login, advance, userProgress } = this.props
    let discuss
    if (IOS) {
      discuss = '本集讨论'
    } else {
      discuss = `(+${item.comment}) ${item.name_cn || item.name || '本集讨论'}`
    }

    let data
    if (login) {
      data = [userProgress[item.id] === '看过' ? '撤销' : '看过']
      if (advance) {
        data.push('想看', '抛弃')
      }
      data.push('看到', discuss)
    } else {
      data = [discuss]
    }

    if (canPlay) {
      data.push('在线播放')
    }

    return data
  }

  renderOverlay(item) {
    return (
      <Menu
        title={[
          `ep.${item.sort} ${item.name_cn || item.name}`,
          `${item.airdate} 讨论数：${item.comment}`
        ]}
        data={this.getPopoverData(item)}
        onSelect={value => this.onSelect(value, item)}
      />
    )
  }

  /**
   * @param {*} item
   * @param {*} num  当前第几个
   */
  renderButton(item, num) {
    const { numbersOfLine, userProgress, onLongPress } = this.props
    const { width, margin } = this.style
    const isSide = num % numbersOfLine === 0
    const popoverProps = IOS
      ? {
          overlay: this.renderOverlay(item)
        }
      : {
          data: this.getPopoverData(item),
          onSelect: value => this.onSelect(value, item)
        }

    return (
      <Popover
        key={item.id}
        style={{
          marginRight: isSide ? 0 : margin,
          marginBottom: margin
        }}
        onLongPress={() => onLongPress(item)}
        {...popoverProps}
      >
        <Button
          type={getType(userProgress[item.id], item.status)}
          size='sm'
          style={{
            width,
            height: width
          }}
        >
          {item.sort}
        </Button>
        {systemStore.setting.heatMap && (
          <View
            style={[
              styles.hotBar,
              {
                opacity:
                  (item.comment - this.commentMin / 1.68) / this.commentMax
              }
            ]}
          />
        )}
      </Popover>
    )
  }

  /**
   * @param {*} itemsSp
   * @param {*} preNum  之前有几个
   */
  renderSp(itemsSp = [], preNum = 0) {
    if (!itemsSp.length) {
      return null
    }

    const { numbersOfLine } = this.props
    const { width, margin } = this.style
    const isSide = (preNum + 1) % numbersOfLine === 0
    return (
      <>
        {!!itemsSp.length && (
          <Flex
            style={[
              styles.sp,
              {
                width,
                height: width - 4, // 感觉短一点好看
                marginRight: isSide ? 0 : margin,
                marginBottom: margin
              }
            ]}
            justify='center'
          >
            <Text type='sub' size={12}>
              SP
            </Text>
          </Flex>
        )}
        {itemsSp.map((item, index) =>
          this.renderButton(item, preNum + index + 2)
        )}
      </>
    )
  }

  renderNormal(eps) {
    const itemsNormal = []
    const itemsSp = []
    eps.forEach(item => {
      const label = MODEL_EP_TYPE.getLabel(item.type)
      if (label === '普通') {
        itemsSp.push(item)
      } else if (label === 'SP') {
        itemsNormal.push(item)
      }
    })
    return (
      <Flex wrap='wrap' align='start'>
        {itemsNormal.map((item, index) => this.renderButton(item, index + 1))}
        {this.renderSp(itemsSp, itemsNormal.length)}
      </Flex>
    )
  }

  renderCarousel(epsGroup) {
    return (
      <Carousel
        style={styles.carousel}
        dotStyle={styles.dotStyle}
        dotActiveStyle={styles.dotActiveStyle}
        infinite
      >
        {epsGroup
          // @todo 渲染过多会卡顿, 暂时只取前5页
          .filter((item, index) => index < 5)
          .map((eps, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <View key={index}>{this.renderNormal(eps)}</View>
          ))}
      </Carousel>
    )
  }

  render() {
    const { numbersOfLine, advance, eps } = this.props
    let _eps = eps || []
    let hasSp = false // 是否有SP
    if (!advance) {
      _eps = _eps.filter(item => {
        const isNormal = MODEL_EP_TYPE.getLabel(item.type) !== '普通'
        if (!isNormal) {
          hasSp = true
        }
        return isNormal
      })
    }
    _eps = _eps
      // 保证SP排在普通章节后面
      .sort((a, b) => {
        const sortA = MODEL_EP_TYPE.getLabel(a.type) === '普通' ? 1 : 0
        const sortB = MODEL_EP_TYPE.getLabel(b.type) === '普通' ? 1 : 0
        return sortA - sortB
      })

    // SP可能会占用一格, 若eps当中存在sp, 每组要减1项避免换行
    const arrNum = numbersOfLine * 4 - (hasSp ? 1 : 0)
    const pages = arrGroup(_eps, arrNum)
    if (!pages.length) {
      return null
    }
    const { style, pagination } = this.props
    const { width } = this.state
    const mounted = width !== 0
    const _style = mounted ? style : undefined
    if (pagination) {
      return (
        <View style={_style} onLayout={this.onLayout}>
          {mounted
            ? pages.length === 1
              ? this.renderNormal(pages[0])
              : this.renderCarousel(pages)
            : null}
        </View>
      )
    }

    return (
      <View
        style={[
          _style,
          {
            marginBottom: this.style.margin ? -this.style.margin : 0 // 抵消最后一行的marginBottom
          }
        ]}
        onLayout={this.onLayout}
      >
        {mounted ? this.renderNormal(pages[0]) : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  carousel: {
    height: 224
  },
  dotStyle: {
    backgroundColor: _.colorPlain,
    borderWidth: 1,
    borderColor: _.colorDesc
  },
  dotActiveStyle: {
    backgroundColor: _.colorDesc
  },
  sp: {
    marginTop: 2,
    borderLeftWidth: 2,
    borderColor: _.colorSub
  },
  hotBar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 4,
    marginBottom: -4,
    backgroundColor: _.colorWarning,
    borderRadius: 4
  }
})

function getType(progress, status) {
  switch (progress) {
    case '想看':
      return 'main'
    case '看过':
      return 'primary'
    case '抛弃':
      return 'disabled'
    default:
      break
  }
  switch (status) {
    case 'Air':
      return 'ghostPrimary'
    case 'Today':
      return 'ghostSuccess'
    default:
      return 'ghostPlain'
  }
}
