import AdBlog from 'components/AdBlog'
import SocialLinks from 'components/SocialLinks'
import useWindowSize from 'hooks/useWindowSize'

import * as S from './styled'

const Sidebar = () => {
  const { width } = useWindowSize()

  return (
    <S.SidebarContainer>
      <S.SidebarLinksContainer>
        <SocialLinks />
        {width > 1169 && (
          <AdBlog
            url="/assets/img/movisul-blog-gif.gif"
            name="serviços de outsourcing e outros"
          />
        )}
      </S.SidebarLinksContainer>
    </S.SidebarContainer>
  )
}

export default Sidebar
