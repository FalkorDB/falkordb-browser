"use client"

import * as React from "react"
import { Slider as UISlider, type SliderProps as UISliderProps } from "@falkordb/ui"

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

interface SliderProps extends Omit<UISliderProps, "renderThumb"> {
  type?: "seconds" | "%" | "px" | "items" | "multiplier"
}

// The browser's sliders read their value out in a tooltip on the thumb, with
// the unit the setting is measured in, and ring the thumb on focus.
const Slider = React.forwardRef<
  React.ComponentRef<typeof UISlider>,
  SliderProps
>(({ value, type = "seconds", ...props }, ref) => (
  <UISlider
    ref={ref}
    value={value}
    thumbClassName="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    renderThumb={(thumb) => (
      <Tooltip>
        <TooltipTrigger asChild>{thumb}</TooltipTrigger>
        <TooltipContent>
          {type === "multiplier" ? `${value}x` : <>{value} {type}</>}
        </TooltipContent>
      </Tooltip>
    )}
    {...props}
  />
))
Slider.displayName = "Slider"

export { Slider }
