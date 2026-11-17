# Large graphs in 3D

Before entering 3D, loading results in 3D, restoring a graph, or adding elements,
the browser checks the graph size against advisory device-adjusted budgets:

| Device hints | Nodes | Relationships |
|---|---:|---:|
| RAM hint or logical CPU count at most 2 | 500 | 1,000 |
| RAM hint or logical CPU count at most 4 | 1,000 | 2,500 |
| Both hints at least 8 | 4,000 | 10,000 |
| Other or unavailable hints | 2,000 | 5,000 |

RAM hints are in GiB. If either count exceeds its budget, the graph stays in 2D
while a warning offers **Use 2D (recommended)** or **Proceed with 3D**. Proceeding
approves up to those counts for the mounted view; growing beyond either approved
count warns again. Switching back to 2D or leaving the view clears approval.
These are conservative heuristics, not benchmarked safe limits: browser resource
hints are coarse, may be unavailable, and do not expose free GPU memory. Choosing
3D can still freeze or crash the tab; use query limits to reduce large results.

On the first 3D request, a temporary WebGL2 context checks GPU capabilities once
per page load and is immediately released. No benchmark or frame-time monitoring
runs. GPU checks can only lower the CPU/RAM budgets. The first matching row
applies; a texture/renderbuffer limit means either reported limit:

| GPU capability | Maximum nodes | Maximum relationships |
|---|---:|---:|
| WebGL2 unavailable (could not start) | 0 | 0 |
| Recognized software renderer, or texture/renderbuffer limit at most 4,096 | 500 | 1,000 |
| Texture/renderbuffer limit at most 8,192 | 1,000 | 2,500 |
| WebGL2 probe result is `unknown`, or a texture/renderbuffer limit is unavailable | 2,000 | 5,000 |
| Both texture/renderbuffer limits above 8,192 | 4,000 | 10,000 |

If WebGL2 cannot start, any non-empty graph warns before attempting 3D.
**Proceed with 3D** still permits an attempt; initialization failures return to
2D with an error notification. Renderer information, when exposed, is used only
to recognize software rendering; GPU identification strings are neither retained
nor sent to a server. Graphics limits indicate supported dimensions, not GPU
speed or free VRAM. Hidden renderer information does not prove hardware
acceleration, and cached capabilities do not track later GPU/driver changes.
