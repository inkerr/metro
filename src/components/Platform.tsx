import React, { PureComponent } from 'react'
import { Point } from 'leaflet'

import Platform from 'network/Platform'

import Modal from './Modal'
import Circle from './Circle'
import Stadium from './Stadium'

interface Props {
  position: Point | Point[],
  radius: number,
  color?: string,
  isFeatured?: boolean,
  platform: Platform,
  dummyParent: Element | null,
  onMouseOver?: (platform: Platform) => void,
  onMouseOut?: () => void,
}

class PlatformReact extends PureComponent<Props> {
  onMouseOver = (e) => {
    const { platform, onMouseOver } = this.props
    if (!onMouseOver) {
      return
    }
    onMouseOver(platform)
  }

  private getPlatformElement = (props) => {
    const { position } = this.props
    return Array.isArray(position) ? (
      <Stadium
        {...props}
        c1={position[0]}
        c2={position[1]}
      />
    ) : (
      <Circle
        {...props}
        center={position}
      />
    )
  }

  render() {
    const {
      radius,
      color,
      isFeatured,
      platform,
      dummyParent,
      onMouseOut,
    } = this.props

    const El = this.getPlatformElement
    const realRadius = isFeatured ? radius * 1.25 : radius
    const dummyRadius = radius * 2

    return (
      <>
        <El
          radius={realRadius}
          stroke={color}
        />
        {dummyParent &&
          <Modal
            tagName="g"
            modalRoot={dummyParent}
          >
            <El
              data-id={platform.id}
              radius={dummyRadius}
              onMouseOver={this.onMouseOver}
              onMouseOut={onMouseOut}
            />
          </Modal>
        }
      </>
    )
  }
}

export default PlatformReact
