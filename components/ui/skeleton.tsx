import * as React from "react"
import { Skeleton as UISkeleton } from "@falkordb/ui"

// `#skeleton` is how the browser's tests find a loading placeholder.
function Skeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  return <UISkeleton id="skeleton" {...props} />
}

export { Skeleton }
