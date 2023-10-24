/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { SpanBox } from '../LayoutPrimitives'
import { IconProps } from './IconProps'

import React from 'react'

export class FavoriteFlairIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 17 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M5.39136 2.61542C5.9814 2.51489 6.58648 2.54805 7.162 2.71247C7.73752 2.87689 8.2688 3.16837 8.71669 3.56542L8.74136 3.58742L8.76402 3.56742C9.19149 3.19229 9.69404 2.91262 10.2381 2.74708C10.7822 2.58154 11.3554 2.53392 11.9194 2.60742L12.0834 2.63142C12.7942 2.75416 13.4587 3.06686 14.0063 3.5364C14.554 4.00594 14.9645 4.61485 15.1943 5.29865C15.4242 5.98244 15.4648 6.71566 15.312 7.42067C15.1591 8.12568 14.8184 8.77622 14.326 9.30342L14.206 9.42676L14.174 9.45409L9.20736 14.3734C9.09274 14.4869 8.94089 14.5549 8.77995 14.565C8.619 14.575 8.45986 14.5264 8.33203 14.4281L8.26936 14.3734L3.27402 9.42542C2.74484 8.91053 2.36849 8.25921 2.18666 7.5436C2.00484 6.82799 2.02463 6.07602 2.24384 5.37097C2.46305 4.66591 2.87313 4.03529 3.42867 3.54894C3.9842 3.06259 4.66351 2.73949 5.39136 2.61542Z"
            fill="#F8023B"
          />
        </g>
      </svg>
    )
  }
}
