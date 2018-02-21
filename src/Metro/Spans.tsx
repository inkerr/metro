import React, { PureComponent } from 'react'
import styled from 'styled-components'
import { Point } from 'leaflet'

import Modal from 'components/Modal'
import Bezier from 'components/primitives/Bezier'

import Route from 'network/Route'

import * as math from 'util/math'

import {
  tryGetFromMap,
} from 'util/collections'

import {
  Span,
  Platform,
} from '../network'

const E_COLORS = [
  '#f0f',
  '#f00',
  '#00f',
  '#080',
  '#f80',
  '#808',
  '#ff0',
  '#840',
  '#4af',
]

const CURVE_SPLIT_NUM = 8

const Paths = styled.g`
  fill: none;
`

const Inner = styled(Paths)`
`

const Outer = styled(Paths)`
`

const PathsOuter = styled(Outer)`
`

const PathsInner = styled(Inner)`
`

interface Props {
  spans: Span[],
  lineWidth: number,
  lineRules: Map<string, CSSStyleDeclaration>,
  detailedE: boolean,
  pathsInnerWrapper: SVGGElement,
  getPlatformPosition: (platform: Platform) => Point,
  getPlatformWhiskers: (platform: Platform) => Map<Span, Point>,
  getPlatformSlot: (platform: Platform) => Map<Route, number> | null,
  getSpanOffset: (span: Span) => number,
}

class Spans extends PureComponent<Props> {
  state = {
    pathsInner: null,
  }

  private mountInner = (g: SVGGElement) => {
    this.setState({
      pathsInner: g,
    })
  }

  private makePath(span: Span) {
    const { detailedE } = this.props

    const {
      routes,
      source,
      target,
    } = span

    if (routes.length === 0) {
      console.error(span, 'span has no routes!')
      throw new Error('span has no routes!')
    }
    const tokens = routes[0].line.match(/([MEL])(\d{0,2})/)
    if (!tokens) {
      throw new Error(`match failed for ${source.name}-${target.name}`)
    }
    const [lineId, lineType] = tokens

    const controlPoints = this.getControlPoints(span)

    const {
      lineRules,
    } = this.props

    // drawBezierHints(this.overlay.origin, controlPoints, get(this.lineRules.get(lineId), 'stroke') as string)
    const lineStyle = lineRules.get(lineType === 'M' ? routes[0].line : lineType)
    const color = detailedE
      ? (lineType === 'E' ? E_COLORS[routes[0].branch] : '#999')
      : lineStyle && lineStyle.stroke
    const bezier = (
      <Bezier
        key={span.id}
        controlPoints={controlPoints[0]}
        tails={controlPoints.slice(1)}
        color={color}
      />
    )
    // bezier.id = 'op-' + spanIndex;
    if (lineType === 'E') {
      // bezier.classList.add('E')
      // const { branch } = span.routes[0];
      // if (branch !== undefined) {
      //     bezier.classList.add('E' + branch);
      // }
      const inner = (
        <Bezier
          controlPoints={controlPoints[0]}
          tails={controlPoints.slice(1)}
        />
      )
      // inner.id = 'ip-' + spanIndex;
      // pool.outerEdgeBindings.set(span, bezier)
      // pool.innerEdgeBindings.set(span, inner)
      return [bezier, inner]
    }
    // if (lineId !== undefined) {
    //     bezier.classList.add(lineId)
    // }
    // if (lineType !== undefined) {
    //     bezier.classList.add(lineType)
    // } else {
    //     bezier.style.stroke = 'black'
    // }
    // pool.outerEdgeBindings.set(span, bezier)
    return [bezier]
  }

  private getControlPoints(span: Span) {
    const {
      getPlatformPosition,
      getPlatformWhiskers,
      getPlatformSlot,
      getSpanOffset,
    } = this.props
    const { source, target } = span
    const sourcePos = getPlatformPosition(source)
    const targetPos = getPlatformPosition(target)

    const sourceControlPoint = tryGetFromMap(getPlatformWhiskers(source), span)
    const targetControlPoint = tryGetFromMap(getPlatformWhiskers(target), span)

    const controlPoints = [
      sourcePos,
      sourceControlPoint,
      targetControlPoint,
      targetPos,
    ]

    const firstRoute = span.routes[0]

    const sourceMap = getPlatformSlot(source)
    const targetMap = getPlatformSlot(target)
    const sourceSlot = sourceMap && sourceMap.get(firstRoute) || 0
    const targetSlot = targetMap && targetMap.get(firstRoute) || 0

    const offset = getSpanOffset(span)

    if (sourceSlot === 0 && targetSlot === 0 && offset === 0) {
      return [controlPoints]
    }

    const sourceLine = controlPoints.slice(0, 2)
    const targetLine = controlPoints.slice(2, 4)

    // TODO: figure out what to do with zero lines
    const offsetSourceLine = sourceLine[0] === sourceLine[1]
      ? sourceLine
      : math.offsetLine(sourceLine, sourceSlot - offset)

    const offsetTargetLine = targetLine[0] === targetLine[1]
      ? targetLine
      : math.offsetLine(targetLine, targetSlot - offset)

    controlPoints[0] = offsetSourceLine[0]
    controlPoints[1] = offsetSourceLine[1]
    controlPoints[2] = offsetTargetLine[0]
    controlPoints[3] = offsetTargetLine[1]

    if (offset === 0) {
      return [controlPoints]
    }

    const curves = math.split(controlPoints, CURVE_SPLIT_NUM)
    const [head, ...tail] = curves.map(pa => math.offsetPath(pa, offset))
    return [head, ...tail.map(arr => arr.slice(1))]
  }

  render() {
    const {
      spans,
      lineWidth,
      pathsInnerWrapper,
    } = this.props

    const {
      pathsInner,
    } = this.state

    const outerStrokeWidth = lineWidth
    const innerStrokeWidth = lineWidth / 2

    return (
      <>
        <PathsOuter
          style={{
            strokeWidth: `${outerStrokeWidth}px`,
          }}
        >
          {pathsInner && spans.map(span => {
            const [outer] = this.makePath(span)
            return outer
          })}
        </PathsOuter>

        <Modal
          tagName="g"
          modalRoot={pathsInnerWrapper}
        >
          <PathsInner
            innerRef={this.mountInner}
            style={{
              strokeWidth: `${innerStrokeWidth}px`,
            }}
          />
        </Modal>
      </>
    )
  }
}

export default Spans