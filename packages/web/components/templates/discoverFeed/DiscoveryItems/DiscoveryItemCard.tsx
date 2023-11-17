import { LayoutType } from "../../homeFeed/HomeFeedContainer"
import { UserBasicData } from "../../../../lib/networking/queries/useGetViewerQuery"
import { DiscoveryGridCard } from "./DiscoveryItemGridCard"
import { DiscoveryItemListCard } from "./DiscoveryItemListCard"
import { DiscoveryItem } from "../../../../lib/networking/queries/useGetDiscoveryItems"

export type DiscoveryItemCardProps = {
  item: DiscoveryItem
  layout: LayoutType
  viewer: UserBasicData
  isHovered?: boolean
  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<void>
}

export function DiscoveryItemCard(props: DiscoveryItemCardProps): JSX.Element {
  if (props.layout == 'LIST_LAYOUT') {
    return <DiscoveryItemListCard {...props} />
  } else {
    return <DiscoveryGridCard {...props} />
  }
}
